import { 
  type User, 
  type InsertUser,
  type File,
  type InsertFile,
  type Job,
  type InsertJob,
  type JobRun,
  type InsertJobRun,
  type KbEntry,
  type InsertKbEntry
} from "@shared/schema";
import { db } from "./db";
import { users, files, jobs, jobRuns, kbEntries } from "@shared/schema";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // File operations
  createFile(file: InsertFile): Promise<File>;
  getFile(tenantId: string, fileId: string): Promise<File | undefined>;
  listFiles(tenantId: string): Promise<File[]>;
  updateFileStatus(tenantId: string, fileId: string, status: string, extractedText?: string): Promise<void>;
  
  // Job operations
  createJob(job: InsertJob): Promise<Job>;
  getJob(tenantId: string, jobId: string): Promise<Job | undefined>;
  listJobs(tenantId: string, status?: string): Promise<Job[]>;
  dequeueJob(tenantId: string): Promise<Job | undefined>;
  updateJobStatus(tenantId: string, jobId: string, status: string, error?: string): Promise<void>;
  
  // Job run operations
  createJobRun(jobRun: InsertJobRun): Promise<JobRun>;
  updateJobRunStatus(tenantId: string, runId: string, status: string, result?: any, error?: string): Promise<void>;
  
  // KB entry operations
  createKbEntry(entry: InsertKbEntry): Promise<KbEntry>;
  listKbEntries(tenantId: string, category?: string): Promise<KbEntry[]>;
  searchKbEntries(tenantId: string, query: string): Promise<KbEntry[]>;
}

export class DbStorage implements IStorage {
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username)).limit(1);
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async createFile(file: InsertFile): Promise<File> {
    const [created] = await db.insert(files).values(file).returning();
    return created;
  }

  async getFile(tenantId: string, fileId: string): Promise<File | undefined> {
    const [file] = await db
      .select()
      .from(files)
      .where(and(eq(files.tenantId, tenantId), eq(files.id, fileId)))
      .limit(1);
    return file;
  }

  async listFiles(tenantId: string): Promise<File[]> {
    return db.select().from(files).where(eq(files.tenantId, tenantId)).orderBy(desc(files.uploadedAt));
  }

  async updateFileStatus(tenantId: string, fileId: string, status: string, extractedText?: string): Promise<void> {
    const updates: any = { status };
    if (extractedText !== undefined) {
      updates.extractedText = extractedText;
    }
    await db
      .update(files)
      .set(updates)
      .where(and(eq(files.tenantId, tenantId), eq(files.id, fileId)));
  }

  async createJob(job: InsertJob): Promise<Job> {
    const [created] = await db.insert(jobs).values(job).returning();
    return created;
  }

  async getJob(tenantId: string, jobId: string): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(and(eq(jobs.tenantId, tenantId), eq(jobs.id, jobId)))
      .limit(1);
    return job;
  }

  async listJobs(tenantId: string, status?: string): Promise<Job[]> {
    if (status) {
      return db
        .select()
        .from(jobs)
        .where(and(eq(jobs.tenantId, tenantId), eq(jobs.status, status)))
        .orderBy(desc(jobs.scheduledAt));
    }
    return db.select().from(jobs).where(eq(jobs.tenantId, tenantId)).orderBy(desc(jobs.scheduledAt));
  }

  async dequeueJob(tenantId: string): Promise<Job | undefined> {
    const [job] = await db
      .select()
      .from(jobs)
      .where(
        and(
          eq(jobs.tenantId, tenantId),
          eq(jobs.status, "queued"),
          sql`${jobs.scheduledAt} <= NOW()`
        )
      )
      .orderBy(desc(jobs.priority), asc(jobs.scheduledAt))
      .limit(1);

    if (job) {
      await db
        .update(jobs)
        .set({ status: "running", startedAt: new Date(), attempts: job.attempts + 1 })
        .where(eq(jobs.id, job.id));
      return { ...job, status: "running", attempts: job.attempts + 1 };
    }
    return undefined;
  }

  async updateJobStatus(tenantId: string, jobId: string, status: string, error?: string): Promise<void> {
    const updates: any = { status };
    if (status === "succeeded" || status === "failed") {
      updates.finishedAt = new Date();
    }
    if (error) {
      updates.error = error;
    }
    await db
      .update(jobs)
      .set(updates)
      .where(and(eq(jobs.tenantId, tenantId), eq(jobs.id, jobId)));
  }

  async createJobRun(jobRun: InsertJobRun): Promise<JobRun> {
    const [created] = await db.insert(jobRuns).values(jobRun).returning();
    return created;
  }

  async updateJobRunStatus(
    tenantId: string, 
    runId: string, 
    status: string, 
    result?: any, 
    error?: string
  ): Promise<void> {
    const updates: any = { status };
    if (status === "succeeded" || status === "failed") {
      updates.finishedAt = new Date();
    }
    if (status === "running") {
      updates.startedAt = new Date();
    }
    if (result !== undefined) {
      updates.result = result;
    }
    if (error) {
      updates.error = error;
    }
    await db
      .update(jobRuns)
      .set(updates)
      .where(and(eq(jobRuns.tenantId, tenantId), eq(jobRuns.id, runId)));
  }

  async createKbEntry(entry: InsertKbEntry): Promise<KbEntry> {
    const [created] = await db.insert(kbEntries).values(entry).returning();
    return created;
  }

  async listKbEntries(tenantId: string, category?: string): Promise<KbEntry[]> {
    if (category) {
      return db
        .select()
        .from(kbEntries)
        .where(and(eq(kbEntries.tenantId, tenantId), eq(kbEntries.category, category)))
        .orderBy(desc(kbEntries.createdAt));
    }
    return db.select().from(kbEntries).where(eq(kbEntries.tenantId, tenantId)).orderBy(desc(kbEntries.createdAt));
  }

  async searchKbEntries(tenantId: string, query: string): Promise<KbEntry[]> {
    const searchPattern = `%${query}%`;
    return db
      .select()
      .from(kbEntries)
      .where(
        and(
          eq(kbEntries.tenantId, tenantId),
          sql`(${kbEntries.title} ILIKE ${searchPattern} OR ${kbEntries.summary} ILIKE ${searchPattern})`
        )
      )
      .orderBy(desc(kbEntries.createdAt));
  }
}

export const storage = new DbStorage();
