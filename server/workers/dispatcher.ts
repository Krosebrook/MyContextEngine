import { storage } from "../storage";
import { db } from "../db";
import { users } from "@shared/schema";

export async function dispatch() {
  try {
    // Fetch all active tenants from users table
    const tenantRecords = await db.select({ id: users.id }).from(users);
    const tenants = tenantRecords.map(t => t.id);
    
    if (tenants.length === 0) {
      return; // No tenants to process
    }
    
    for (const tenantId of tenants) {
      try {
        const job = await storage.dequeueJob(tenantId);
        
        if (job) {
          console.log(`[Dispatcher] Dequeued job ${job.id} of kind ${job.kind} for tenant ${tenantId}`);
          
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
  } catch (error) {
    console.error(`[Dispatcher] Fatal error fetching tenants:`, error);
  }
}

export function startDispatcher(intervalMs: number = 10000) {
  console.log(`[Dispatcher] Starting with interval ${intervalMs}ms`);
  setInterval(dispatch, intervalMs);
  dispatch(); // Run immediately
}
