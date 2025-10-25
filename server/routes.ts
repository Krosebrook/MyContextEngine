import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import multer from "multer";
import path from "path";
import { randomUUID } from "crypto";
import { z } from "zod";

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

function getTenantId(req: any): string {
  return req.session?.tenantId || "default-tenant";
}

export async function registerRoutes(app: Express): Promise<Server> {
  // File upload endpoint
  app.post("/api/files/upload", upload.single("file"), async (req, res) => {
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

      const job = await storage.createJob({
        tenantId,
        kind: "text_extract",
        status: "queued",
        priority: 100,
        metadata: { fileId: file.id },
      });

      res.json({ file, job });
    } catch (error: any) {
      console.error("Upload error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // List files
  app.get("/api/files", async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const files = await storage.listFiles(tenantId);
      res.json(files);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single file
  app.get("/api/files/:id", async (req, res) => {
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

  // List jobs
  app.get("/api/jobs", async (req, res) => {
    try {
      const tenantId = getTenantId(req);
      const status = req.query.status as string | undefined;
      const jobs = await storage.listJobs(tenantId, status);
      res.json(jobs);
    } catch (error: any) {
      res.status(500).json({ error: error.message });
    }
  });

  // Get single job
  app.get("/api/jobs/:id", async (req, res) => {
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

  // Retry job
  app.post("/api/jobs/:id/retry", async (req, res) => {
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

  // Cancel job
  app.post("/api/jobs/:id/cancel", async (req, res) => {
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

  // List KB entries
  app.get("/api/kb", async (req, res) => {
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

  // Dashboard stats
  app.get("/api/stats", async (req, res) => {
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

  const httpServer = createServer(app);
  return httpServer;
}
