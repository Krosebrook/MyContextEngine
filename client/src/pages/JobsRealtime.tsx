import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { JobsTable, Job } from "@/components/JobsTable";
import { Button } from "@/components/ui/button";
import { Filter, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { supabase, type SupabaseJob } from "@/lib/supabase";

export default function JobsRealtime() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [realtimeJobs, setRealtimeJobs] = useState<Job[]>([]);
  const { toast } = useToast();

  // Initial load from API
  const { data: initialJobs = [], isLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  // Set initial jobs
  useEffect(() => {
    if (initialJobs.length > 0 && realtimeJobs.length === 0) {
      setRealtimeJobs(initialJobs);
    }
  }, [initialJobs]);

  // Subscribe to real-time updates
  useEffect(() => {
    const channel = supabase
      .channel("jobs-changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "jobs",
        },
        (payload) => {
          console.log("[Real-time] Job change:", payload);

          if (payload.eventType === "INSERT") {
            const newJob = transformSupabaseJob(payload.new as SupabaseJob);
            setRealtimeJobs((prev) => [newJob, ...prev]);
          } else if (payload.eventType === "UPDATE") {
            const updatedJob = transformSupabaseJob(payload.new as SupabaseJob);
            setRealtimeJobs((prev) =>
              prev.map((job) => (job.id === updatedJob.id ? updatedJob : job))
            );
          } else if (payload.eventType === "DELETE") {
            setRealtimeJobs((prev) =>
              prev.filter((job) => job.id !== (payload.old as any).id)
            );
          }
        }
      )
      .subscribe((status) => {
        console.log("[Real-time] Subscription status:", status);
      });

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const transformSupabaseJob = (sJob: SupabaseJob): Job => ({
    id: sJob.id,
    tenantId: sJob.tenant_id,
    kind: sJob.kind,
    status: sJob.status as "queued" | "running" | "succeeded" | "failed" | "canceled",
    priority: sJob.priority,
    metadata: sJob.metadata,
    result: sJob.result,
    error: sJob.error,
    attempts: sJob.attempts,
    maxAttempts: sJob.max_attempts,
    scheduledAt: sJob.scheduled_at || new Date().toISOString(),
    startedAt: sJob.started_at || undefined,
    finishedAt: sJob.finished_at || undefined,
  });

  const retryMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("POST", `/api/jobs/${jobId}/retry`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job queued for retry",
        description: "The job will be reprocessed",
      });
    },
    onError: () => {
      toast({
        title: "Retry failed",
        variant: "destructive",
      });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (jobId: string) => {
      return apiRequest("POST", `/api/jobs/${jobId}/cancel`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/jobs"] });
      toast({
        title: "Job canceled",
      });
    },
    onError: () => {
      toast({
        title: "Cancel failed",
        variant: "destructive",
      });
    },
  });

  const allJobs = realtimeJobs.length > 0 ? realtimeJobs : initialJobs;

  const filteredJobs = allJobs.filter((job) => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSearch =
      job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      job.kind.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">
            Jobs <span className="text-sm text-green-600 font-normal">● Live</span>
          </h1>
          <p className="text-muted-foreground mt-1">
            Real-time file processing and AI analysis job monitoring
          </p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by ID or type..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            data-testid="input-search-jobs"
          />
        </div>
        <div className="flex gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40" data-testid="select-status-filter">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="queued">Queued</SelectItem>
              <SelectItem value="running">Running</SelectItem>
              <SelectItem value="succeeded">Succeeded</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
              <SelectItem value="canceled">Canceled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground border rounded-md">
          No jobs found. Upload some files to create processing jobs.
        </div>
      ) : (
        <>
          <JobsTable
            jobs={filteredJobs}
            onViewDetails={(id) => console.log("View job:", id)}
            onRetry={(id) => retryMutation.mutate(id)}
            onCancel={(id) => cancelMutation.mutate(id)}
          />

          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>
              Showing {filteredJobs.length} of {allJobs.length} jobs
            </span>
          </div>
        </>
      )}
    </div>
  );
}
