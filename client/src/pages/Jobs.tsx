import { JobsTable, Job } from "@/components/JobsTable";
import { Button } from "@/components/ui/button";
import { Plus, Filter } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";

export default function Jobs() {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");

  const mockJobs: Job[] = [
    {
      id: "job-001-abc-def-ghi",
      kind: "neon_to_clickhouse",
      status: "running",
      priority: 100,
      scheduledAt: new Date(Date.now() - 3600000).toISOString(),
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      attempts: 1,
      maxAttempts: 5,
    },
    {
      id: "job-002-xyz-uvw-rst",
      kind: "reindex",
      status: "succeeded",
      priority: 80,
      scheduledAt: new Date(Date.now() - 7200000).toISOString(),
      startedAt: new Date(Date.now() - 6000000).toISOString(),
      finishedAt: new Date(Date.now() - 3000000).toISOString(),
      attempts: 1,
      maxAttempts: 5,
    },
    {
      id: "job-003-lmn-opq-tuv",
      kind: "custom",
      status: "failed",
      priority: 90,
      scheduledAt: new Date(Date.now() - 10800000).toISOString(),
      startedAt: new Date(Date.now() - 9000000).toISOString(),
      finishedAt: new Date(Date.now() - 8000000).toISOString(),
      attempts: 3,
      maxAttempts: 5,
    },
    {
      id: "job-004-wxy-zab-cde",
      kind: "neon_to_clickhouse",
      status: "queued",
      priority: 100,
      scheduledAt: new Date(Date.now() + 1800000).toISOString(),
      attempts: 0,
      maxAttempts: 5,
    },
    {
      id: "job-005-fgh-ijk-lmn",
      kind: "reindex",
      status: "canceled",
      priority: 60,
      scheduledAt: new Date(Date.now() - 14400000).toISOString(),
      startedAt: new Date(Date.now() - 12600000).toISOString(),
      finishedAt: new Date(Date.now() - 12000000).toISOString(),
      attempts: 1,
      maxAttempts: 5,
    },
  ];

  const filteredJobs = mockJobs.filter((job) => {
    const matchesStatus = statusFilter === "all" || job.status === statusFilter;
    const matchesSearch = job.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         job.kind.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Jobs</h1>
          <p className="text-muted-foreground mt-1">
            Manage and monitor your data processing jobs
          </p>
        </div>
        <Button data-testid="button-create-job">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
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

      <JobsTable 
        jobs={filteredJobs}
        onViewDetails={(id) => console.log('View job:', id)}
        onRetry={(id) => console.log('Retry job:', id)}
        onCancel={(id) => console.log('Cancel job:', id)}
      />

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Showing {filteredJobs.length} of {mockJobs.length} jobs</span>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled>Previous</Button>
          <Button variant="outline" size="sm">Next</Button>
        </div>
      </div>
    </div>
  );
}
