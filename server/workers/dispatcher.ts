import { storage } from "../storage";

export async function dispatch() {
  const tenants = ["default-tenant"]; // In production, fetch from users table
  
  for (const tenantId of tenants) {
    try {
      const job = await storage.dequeueJob(tenantId);
      
      if (job) {
        console.log(`[Dispatcher] Dequeued job ${job.id} of kind ${job.kind}`);
        
        const jobRun = await storage.createJobRun({
          tenantId,
          jobId: job.id,
          status: "queued",
        });
        
        console.log(`[Dispatcher] Created job run ${jobRun.id} for job ${job.id}`);
      }
    } catch (error) {
      console.error(`[Dispatcher] Error for tenant ${tenantId}:`, error);
    }
  }
}

export function startDispatcher(intervalMs: number = 10000) {
  console.log(`[Dispatcher] Starting with interval ${intervalMs}ms`);
  setInterval(dispatch, intervalMs);
  dispatch(); // Run immediately
}
