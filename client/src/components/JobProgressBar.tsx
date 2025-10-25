import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";

interface ShardStats {
  queued: number;
  running: number;
  succeeded: number;
  failed: number;
  skipped: number;
}

interface JobProgressBarProps {
  stats: ShardStats;
}

export function JobProgressBar({ stats }: JobProgressBarProps) {
  const total = stats.queued + stats.running + stats.succeeded + stats.failed + stats.skipped;
  const completed = stats.succeeded + stats.failed + stats.skipped;
  const progress = total > 0 ? (completed / total) * 100 : 0;

  return (
    <Card>
      <CardContent className="pt-6">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Job Progress</span>
            <span className="text-muted-foreground">{completed} / {total} shards</span>
          </div>
          <Progress value={progress} className="h-2" />
          <div className="grid grid-cols-5 gap-2 text-xs">
            <div className="text-center">
              <div className="font-mono text-lg">{stats.queued}</div>
              <div className="text-muted-foreground">Queued</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-lg text-blue-600">{stats.running}</div>
              <div className="text-muted-foreground">Running</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-lg text-green-600">{stats.succeeded}</div>
              <div className="text-muted-foreground">Succeeded</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-lg text-red-600">{stats.failed}</div>
              <div className="text-muted-foreground">Failed</div>
            </div>
            <div className="text-center">
              <div className="font-mono text-lg">{stats.skipped}</div>
              <div className="text-muted-foreground">Skipped</div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
