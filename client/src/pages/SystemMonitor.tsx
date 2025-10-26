import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Cpu,
  TrendingUp,
  XCircle,
  Zap,
  AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { Job } from "@/components/JobsTable";
import { useMemo } from "react";

interface Stats {
  totalFiles: number;
  totalJobs: number;
  totalKbEntries: number;
  jobsByStatus: Record<string, number>;
}

export default function SystemMonitor() {
  const { data: jobs = [], isLoading: jobsLoading } = useQuery<Job[]>({
    queryKey: ["/api/jobs"],
    refetchInterval: 5000,
  });

  const { data: stats, isLoading: statsLoading } = useQuery<Stats>({
    queryKey: ["/api/stats"],
    refetchInterval: 5000,
  });

  const analytics = useMemo(() => {
    if (!jobs.length) return null;

    // Success rate
    const totalCompleted = jobs.filter(j => 
      j.status === "succeeded" || j.status === "failed"
    ).length;
    const succeeded = jobs.filter(j => j.status === "succeeded").length;
    const successRate = totalCompleted > 0 ? (succeeded / totalCompleted) * 100 : 0;

    // Average processing time
    const completedJobs = jobs.filter(j => 
      j.finishedAt && j.startedAt
    );
    const avgTime = completedJobs.length > 0
      ? completedJobs.reduce((sum, j) => {
          const start = new Date(j.startedAt!).getTime();
          const end = new Date(j.finishedAt!).getTime();
          return sum + (end - start);
        }, 0) / completedJobs.length / 1000
      : 0;

    // Job types breakdown
    const textExtract = jobs.filter(j => j.kind === "text_extract").length;
    const aiAnalyze = jobs.filter(j => j.kind === "ai_analyze").length;

    // Recent failures
    const recentFailures = jobs
      .filter(j => j.status === "failed")
      .slice(0, 5)
      .map(j => ({
        id: j.id,
        kind: j.kind,
        error: j.error || "Unknown error",
      }));

    // Bottleneck detection
    const bottlenecks: Array<{severity: "critical" | "warning" | "info"; message: string}> = [];
    
    const failureRate = totalCompleted > 0 ? ((jobs.filter(j => j.status === "failed").length) / totalCompleted) * 100 : 0;
    if (failureRate > 20) {
      bottlenecks.push({ 
        severity: "critical", 
        message: `High failure rate: ${failureRate.toFixed(1)}% of jobs failing` 
      });
    }

    const queuedJobs = stats?.jobsByStatus?.queued || 0;
    if (queuedJobs > 20) {
      bottlenecks.push({ 
        severity: "warning", 
        message: `Large queue: ${queuedJobs} jobs waiting to process` 
      });
    }

    const pdfFailures = recentFailures.filter(f => f.error.toLowerCase().includes("pdf"));
    if (pdfFailures.length >= 3) {
      bottlenecks.push({ 
        severity: "warning", 
        message: "PDF extraction failures detected - consider adding pdf-parse library" 
      });
    }

    // Throughput (jobs per minute - estimate)
    const last5Min = jobs.filter(j => {
      if (!j.finishedAt) return false;
      const fiveMinutesAgo = Date.now() - 5 * 60 * 1000;
      return new Date(j.finishedAt).getTime() > fiveMinutesAgo;
    }).length;
    const throughput = last5Min / 5; // jobs per minute

    return {
      successRate,
      avgTime,
      textExtract,
      aiAnalyze,
      recentFailures,
      bottlenecks,
      throughput,
      failureRate,
    };
  }, [jobs, stats]);

  const isLoading = jobsLoading || statsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Activity className="h-8 w-8 animate-pulse text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-medium flex items-center gap-2">
          <Activity className="h-8 w-8" />
          System Monitor
        </h1>
        <p className="text-muted-foreground mt-1">
          Real-time analytics, bottleneck detection, and performance insights
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.successRate.toFixed(1) || 0}%
              </div>
              <p className="text-xs text-muted-foreground">
                {stats?.jobsByStatus?.succeeded || 0} successful jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Processing Time</CardTitle>
              <Clock className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.avgTime.toFixed(1) || 0}s
              </div>
              <p className="text-xs text-muted-foreground">
                Per job completion
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Throughput</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analytics?.throughput.toFixed(1) || 0}
              </div>
              <p className="text-xs text-muted-foreground">
                Jobs per minute (last 5min)
              </p>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Queue Size</CardTitle>
              <Cpu className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {(stats?.jobsByStatus?.queued || 0) + (stats?.jobsByStatus?.running || 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Active + Queued jobs
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Bottlenecks & Gaps */}
      {analytics && analytics.bottlenecks.length > 0 && (
        <Card className="border-orange-200 dark:border-orange-900">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-600 dark:text-orange-400">
              <AlertTriangle className="h-5 w-5" />
              Detected Issues
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {analytics.bottlenecks.map((bottleneck, idx) => (
              <div
                key={idx}
                className="flex items-start gap-3 p-3 rounded-md bg-orange-50 dark:bg-orange-950/20 border border-orange-200 dark:border-orange-900"
              >
                {bottleneck.severity === "critical" ? (
                  <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-orange-600 flex-shrink-0 mt-0.5" />
                )}
                <div className="flex-1">
                  <Badge variant={bottleneck.severity === "critical" ? "destructive" : "outline"} className="mb-2">
                    {bottleneck.severity.toUpperCase()}
                  </Badge>
                  <p className="text-sm">{bottleneck.message}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Job Types Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              Job Type Distribution
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Text Extraction</span>
                <span className="text-sm text-muted-foreground">{analytics?.textExtract || 0} jobs</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-blue-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(analytics && analytics.textExtract > 0) ? (analytics.textExtract / jobs.length) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">AI Analysis</span>
                <span className="text-sm text-muted-foreground">{analytics?.aiAnalyze || 0} jobs</span>
              </div>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <motion.div
                  className="h-full bg-purple-500"
                  initial={{ width: 0 }}
                  animate={{
                    width: `${(analytics && analytics.aiAnalyze > 0) ? (analytics.aiAnalyze / jobs.length) * 100 : 0}%`,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Status Overview
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-green-500"></div>
                Succeeded
              </span>
              <span className="text-sm font-medium">{stats?.jobsByStatus?.succeeded || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-blue-500 animate-pulse"></div>
                Running
              </span>
              <span className="text-sm font-medium">{stats?.jobsByStatus?.running || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-yellow-500"></div>
                Queued
              </span>
              <span className="text-sm font-medium">{stats?.jobsByStatus?.queued || 0}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm flex items-center gap-2">
                <div className="h-2 w-2 rounded-full bg-red-500"></div>
                Failed
              </span>
              <span className="text-sm font-medium">{stats?.jobsByStatus?.failed || 0}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Failures */}
      {analytics && analytics.recentFailures.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <XCircle className="h-5 w-5 text-red-600" />
              Recent Failures
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {analytics.recentFailures.map((failure) => (
                <div
                  key={failure.id}
                  className="p-3 rounded-md border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/20"
                >
                  <div className="flex items-start gap-3">
                    <Badge variant="outline" className="font-mono text-xs">
                      {failure.kind}
                    </Badge>
                    <p className="text-sm flex-1 text-red-900 dark:text-red-100">
                      {failure.error}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle>System Health</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 rounded-md border">
              <div className="text-2xl font-bold text-green-600">
                {stats?.totalFiles || 0}
              </div>
              <p className="text-sm text-muted-foreground">Total Files Processed</p>
            </div>
            <div className="text-center p-4 rounded-md border">
              <div className="text-2xl font-bold text-purple-600">
                {stats?.totalKbEntries || 0}
              </div>
              <p className="text-sm text-muted-foreground">KB Entries Created</p>
            </div>
            <div className="text-center p-4 rounded-md border">
              <div className="text-2xl font-bold text-blue-600">
                {((analytics?.successRate || 0) > 90) ? "Excellent" : 
                 ((analytics?.successRate || 0) > 70) ? "Good" : "Needs Attention"}
              </div>
              <p className="text-sm text-muted-foreground">System Status</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
