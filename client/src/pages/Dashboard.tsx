import { MetricCard } from "@/components/MetricCard";
import { JobsTable, Job } from "@/components/JobsTable";
import { Briefcase, CheckCircle2, TrendingUp, DollarSign } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

export default function Dashboard() {
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
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your orchestration platform
          </p>
        </div>
        <Button data-testid="button-create-job">
          <Plus className="h-4 w-4 mr-2" />
          Create Job
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          title="Total Jobs"
          value="247"
          icon={Briefcase}
          trend={{ value: 12, isPositive: true }}
        />
        <MetricCard
          title="Success Rate"
          value="94.2%"
          icon={CheckCircle2}
          trend={{ value: 3, isPositive: true }}
        />
        <MetricCard
          title="Avg Throughput"
          value="2.4K/min"
          icon={TrendingUp}
          trend={{ value: -5, isPositive: false }}
        />
        <MetricCard
          title="Total Cost"
          value="$142.50"
          icon={DollarSign}
          subtitle="This month"
        />
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Jobs</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="/jobs">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          <JobsTable 
            jobs={mockJobs}
            onViewDetails={(id) => console.log('View job:', id)}
            onRetry={(id) => console.log('Retry job:', id)}
            onCancel={(id) => console.log('Cancel job:', id)}
          />
        </CardContent>
      </Card>
    </div>
  );
}
