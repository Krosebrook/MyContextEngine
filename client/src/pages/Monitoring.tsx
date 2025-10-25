import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { JobProgressBar } from "@/components/JobProgressBar";
import { Badge } from "@/components/ui/badge";
import { Activity, AlertCircle, CheckCircle2 } from "lucide-react";

export default function Monitoring() {
  const jobShardStats = {
    queued: 45,
    running: 12,
    succeeded: 234,
    failed: 8,
    skipped: 3,
  };

  const systemEvents = [
    {
      id: "evt-001",
      timestamp: new Date(Date.now() - 300000).toISOString(),
      level: "info",
      message: "Job dispatcher completed successfully",
      meta: { jobsProcessed: 15 },
    },
    {
      id: "evt-002",
      timestamp: new Date(Date.now() - 600000).toISOString(),
      level: "warn",
      message: "High memory usage detected on worker-03",
      meta: { usage: "87%" },
    },
    {
      id: "evt-003",
      timestamp: new Date(Date.now() - 900000).toISOString(),
      level: "error",
      message: "Failed to connect to ClickHouse cluster",
      meta: { retries: 3 },
    },
    {
      id: "evt-004",
      timestamp: new Date(Date.now() - 1200000).toISOString(),
      level: "info",
      message: "Evaluation run completed with 96% pass rate",
      meta: { runId: "run-002" },
    },
  ];

  const getLevelIcon = (level: string) => {
    switch (level) {
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case "warn":
        return <AlertCircle className="h-4 w-4 text-yellow-600" />;
      default:
        return <CheckCircle2 className="h-4 w-4 text-green-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants: Record<string, { bg: string; text: string }> = {
      error: { bg: "bg-red-100 dark:bg-red-950", text: "text-red-800 dark:text-red-300" },
      warn: { bg: "bg-yellow-100 dark:bg-yellow-950", text: "text-yellow-800 dark:text-yellow-300" },
      info: { bg: "bg-blue-100 dark:bg-blue-950", text: "text-blue-800 dark:text-blue-300" },
    };
    const variant = variants[level] || variants.info;
    
    return (
      <Badge variant="outline" className={`${variant.bg} ${variant.text} border-0`}>
        {level}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium">Monitoring</h1>
        <p className="text-muted-foreground mt-1">
          System health and event logs
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground mt-1">
              All services operational
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Workers</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">8 / 10</div>
            <p className="text-xs text-muted-foreground mt-1">
              2 workers idle
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Error Rate</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-medium">2.6%</div>
            <p className="text-xs text-muted-foreground mt-1">
              Below threshold
            </p>
          </CardContent>
        </Card>
      </div>

      <JobProgressBar stats={jobShardStats} />

      <Card>
        <CardHeader>
          <CardTitle>Recent Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {systemEvents.map((event) => (
              <div
                key={event.id}
                className="flex gap-3 p-3 rounded-md border hover-elevate"
                data-testid={`event-${event.id}`}
              >
                <div className="pt-0.5">{getLevelIcon(event.level)}</div>
                <div className="flex-1 space-y-1">
                  <div className="flex items-center gap-2">
                    {getLevelBadge(event.level)}
                    <span className="text-xs text-muted-foreground font-mono">
                      {new Date(event.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{event.message}</p>
                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <div className="text-xs text-muted-foreground font-mono">
                      {JSON.stringify(event.meta)}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
