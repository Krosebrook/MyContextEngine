import { useQuery } from "@tanstack/react-query";
import { MetricCard } from "@/components/MetricCard";
import { JobsTable, Job } from "@/components/JobsTable";
import { Briefcase, CheckCircle2, Files, BookOpen } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface Stats {
  totalFiles: number;
  totalJobs: number;
  totalKbEntries: number;
  jobsByStatus: Record<string, number>;
}

export default function Dashboard() {
  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
  });

  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
  });

  const recentJobs = jobs.slice(0, 5);

  const successRate = stats
    ? stats.totalJobs > 0
      ? Math.round(((stats.jobsByStatus.succeeded || 0) / stats.totalJobs) * 100)
      : 0
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Overview of your AI-powered file organization system
          </p>
        </div>
      </div>

      {statsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard
            title="Total Files"
            value={stats?.totalFiles || 0}
            icon={Files}
          />
          <MetricCard
            title="KB Entries"
            value={stats?.totalKbEntries || 0}
            icon={BookOpen}
          />
          <MetricCard
            title="Processing Jobs"
            value={stats?.totalJobs || 0}
            icon={Briefcase}
          />
          <MetricCard
            title="Success Rate"
            value={`${successRate}%`}
            icon={CheckCircle2}
          />
        </div>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
          <CardTitle>Recent Jobs</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <a href="/jobs">View All</a>
          </Button>
        </CardHeader>
        <CardContent>
          {jobsLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : recentJobs.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              No jobs yet. Upload some files to get started!
            </div>
          ) : (
            <JobsTable
              jobs={recentJobs}
              onViewDetails={(id) => console.log("View job:", id)}
              onRetry={(id) => console.log("Retry job:", id)}
              onCancel={(id) => console.log("Cancel job:", id)}
            />
          )}
        </CardContent>
      </Card>
    </div>
  );
}
