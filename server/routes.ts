import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";
import { syncFileToSupabase, syncJobToSupabase, getFileDownloadUrl } from "./supabase-sync";

const upload = multer({
  storage: multer.diskStorage({
    destination: "uploads/",
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      const filename = `${randomUUID()}${ext}`;
      cb(null, filename);
    },
  }),
  limits: {
    fileSize: 100 * 1024 * 1024, // 100MB max
  },
});

// Extract tenant ID from authenticated user session
// In production, this uses the user's ID. Falls back to "default-tenant" for backwards compatibility during migration
function getTenantId(req: any): string {
  // If authenticated, use the user's ID as tenant ID (1:1 user-to-tenant mapping)
  if (req.user?.claims?.sub) {
    return req.user.claims.sub;
  }
  // Fallback for development/migration
  return "default-tenant";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup Replit Auth (sessions, passport, OAuth)
  await setupAuth(app);

  // Auth endpoint - returns current user info
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // File upload endpoint (protected)
  app.post("/api/files/upload", isAuthenticated, upload.single("file"), async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      
      if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
      }

      const file = await storage.createFile({
        tenantId,
        filename: req.file.filename,
        originalName: req.file.originalname,
        mimeType: req.file.mimetype,
        size: req.file.size,
        uploadPath: req.file.path,
        status: "uploaded",
      });

      // Sync new file to Supabase
      await syncFileToSupabase(file);

      const job = await storage.createJob({
        tenantId,
        kind: "text_extract",
        status: "queued",
        priority: 100,
        metadata: { fileId: file.id },
      });

      // Sync new job to Supabase for real-time updates
      await syncJobToSupabase(job);

      res.json({ file, job });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // List files (protected)
  app.get("/api/files", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const files = await storage.listFiles(tenantId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single file (protected)
  app.get("/api/files/:id", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const file = await storage.getFile(tenantId, req.params.id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      res.json(file);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List jobs (protected)
  app.get("/api/jobs", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const status = req.query.status as string | undefined;
      const jobs = await storage.listJobs(tenantId, status);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single job (protected)
  app.get("/api/jobs/:id", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const job = await storage.getJob(tenantId, req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      res.json(job);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Retry job (protected)
  app.post("/api/jobs/:id/retry", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const job = await storage.getJob(tenantId, req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      await storage.updateJobStatus(tenantId, req.params.id, "queued");
      const updated = await storage.getJob(tenantId, req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Cancel job (protected)
  app.post("/api/jobs/:id/cancel", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const job = await storage.getJob(tenantId, req.params.id);
      if (!job) {
        return res.status(404).json({ error: "Job not found" });
      }
      
      await storage.updateJobStatus(tenantId, req.params.id, "canceled");
      const updated = await storage.getJob(tenantId, req.params.id);
      res.json(updated);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // List KB entries (protected)
  app.get("/api/kb", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const category = req.query.category as string | undefined;
      const query = req.query.q as string | undefined;
      
      let entries;
      if (query) {
        entries = await storage.searchKbEntries(tenantId, query);
      } else {
        entries = await storage.listKbEntries(tenantId, category);
      }
      
      res.json(entries);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Download file with signed URL (protected)
  app.get("/api/files/:id/download", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const file = await storage.getFile(tenantId, req.params.id);
      if (!file) {
        return res.status(404).json({ error: "File not found" });
      }
      
      const storagePath = `${tenantId}/${file.id}/${file.originalName}`;
      const signedUrl = await getFileDownloadUrl(storagePath);
      
      if (!signedUrl) {
        return res.status(404).json({ error: "File not found in storage" });
      }
      
      res.json({ url: signedUrl });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Dashboard stats (protected)
  app.get("/api/stats", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const files = await storage.listFiles(tenantId);
      const jobs = await storage.listJobs(tenantId);
      const kbEntries = await storage.listKbEntries(tenantId);

      const jobsByStatus = jobs.reduce((acc, job) => {
        acc[job.status] = (acc[job.status] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      res.json({
        totalFiles: files.length,
        totalJobs: jobs.length,
        totalKbEntries: kbEntries.length,
        jobsByStatus,
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Scan local directory (protected)
  app.post("/api/scanner/scan", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const { path } = req.body;
      if (!path) {
        return res.status(400).json({ error: "Path is required" });
      }

      const pathModule = await import("path");
      const os = await import("os");
      
      // Security: Whitelist allowed scan paths per environment
      const allowedRoots = [
        pathModule.join(process.cwd(), "uploads"),
        os.homedir(),
      ];
      
      // Add platform-specific common paths
      if (process.platform === "win32") {
        allowedRoots.push("C:\\", "D:\\", "C:\\Users");
      } else {
        allowedRoots.push("/", "/home", "/tmp");
      }
      
      // Security: Proper path boundary check to prevent prefix bypass
      const resolvedPath = pathModule.resolve(path);
      const isAllowed = allowedRoots.some(root => {
        const resolvedRoot = pathModule.resolve(root);
        const relativePath = pathModule.relative(resolvedRoot, resolvedPath);
        // Allow exact root match (empty string) or paths within root
        return (relativePath === '' || (!relativePath.startsWith('..') && !pathModule.isAbsolute(relativePath)));
      });
      
      if (!isAllowed) {
        return res.status(403).json({ 
          error: "Access denied: Path not in allowed list",
          allowedRoots 
        });
      }

      const fs = await import("fs/promises");
      
      const scanDir = async (dirPath: string, depth = 0): Promise<any[]> => {
        if (depth > 3) return [];
        
        try {
          const entries = await fs.readdir(dirPath, { withFileTypes: true });
          const results = [];
          
          for (const entry of entries.slice(0, 100)) {
            const fullPath = pathModule.join(dirPath, entry.name);
            
            if (entry.isDirectory()) {
              if (!entry.name.startsWith('.') && entry.name !== 'node_modules') {
                const subFiles = await scanDir(fullPath, depth + 1);
                results.push(...subFiles);
              }
            } else if (entry.isFile()) {
              const stats = await fs.stat(fullPath);
              if (stats.size < 100 * 1024 * 1024) {
                results.push({
                  path: fullPath,
                  name: entry.name,
                  size: stats.size,
                  modified: stats.mtime,
                });
              }
            }
            
            if (results.length > 500) break;
          }
          
          return results;
        } catch (error) {
          console.error(`Error scanning ${dirPath}:`, error);
          return [];
        }
      };

      const files = await scanDir(resolvedPath);
      res.json({ files });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Import scanned files (protected)
  app.post("/api/scanner/import", isAuthenticated, async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const { files } = req.body;
      
      if (!Array.isArray(files) || files.length === 0) {
        return res.status(400).json({ error: "Files array is required" });
      }

      const fs = await import("fs/promises");
      const pathModule = await import("path");
      const crypto = await import("crypto");
      const os = await import("os");
      
      // Security: Whitelist allowed paths (same as scan endpoint)
      const allowedRoots = [
        pathModule.join(process.cwd(), "uploads"),
        os.homedir(),
      ];
      
      if (process.platform === "win32") {
        allowedRoots.push("C:\\", "D:\\", "C:\\Users");
      } else {
        allowedRoots.push("/", "/home", "/tmp");
      }
      
      const imported = [];
      const rejected = [];
      
      for (const filePath of files.slice(0, 50)) {
        try {
          // Security: Proper path boundary check to prevent prefix bypass
          const resolvedPath = pathModule.resolve(filePath);
          const isAllowed = allowedRoots.some(root => {
            const resolvedRoot = pathModule.resolve(root);
            const relativePath = pathModule.relative(resolvedRoot, resolvedPath);
            // Allow exact root match (empty string) or paths within root
            return (relativePath === '' || (!relativePath.startsWith('..') && !pathModule.isAbsolute(relativePath)));
          });
          
          if (!isAllowed) {
            rejected.push({ path: filePath, reason: "Path not in allowed list" });
            continue;
          }
          
          const fileName = pathModule.basename(filePath);
          const fileBuffer = await fs.readFile(filePath);
          const fileId = crypto.randomUUID();
          const uploadDir = pathModule.join(process.cwd(), "uploads", tenantId);
          await fs.mkdir(uploadDir, { recursive: true });
          
          const uploadPath = pathModule.join(uploadDir, `${fileId}_${fileName}`);
          await fs.writeFile(uploadPath, fileBuffer);
          
          const stats = await fs.stat(filePath);
          const fileRecord = await storage.createFile({
            tenantId,
            filename: `${fileId}_${fileName}`,
            originalName: fileName,
            mimeType: "application/octet-stream",
            size: stats.size,
            uploadPath: uploadPath,
            status: "pending",
          });
          
          await storage.createJob({
            tenantId,
            kind: "text_extract",
            status: "queued",
            metadata: { fileId: fileRecord.id },
          });
          
          imported.push(fileRecord);
        } catch (error) {
          console.error(`Failed to import ${filePath}:`, error);
          rejected.push({ path: filePath, reason: error instanceof Error ? error.message : "Unknown error" });
        }
      }
      
      res.json({ 
        imported: imported.length, 
        rejected: rejected.length,
        files: imported,
        rejectedFiles: rejected 
      });
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
