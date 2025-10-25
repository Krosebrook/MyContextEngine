import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "./StatusBadge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TrendingUp, Clock, DollarSign, CheckCircle2 } from "lucide-react";

export interface EvalRun {
  id: string;
  suiteName: string;
  promptVersion: string;
  status: "queued" | "running" | "succeeded" | "failed" | "canceled";
  startedAt?: string;
  finishedAt?: string;
  stats?: {
    totalSamples: number;
    passRate: number;
    avgLatencyMs: number;
  };
  costCents?: number;
  providers: string[];
}

interface EvaluationRunCardProps {
  run: EvalRun;
  onViewDetails?: (id: string) => void;
}

export function EvaluationRunCard({ run, onViewDetails }: EvaluationRunCardProps) {
  const formatDate = (date?: string) => {
    if (!date) return "Not started";
    return new Date(date).toLocaleString();
  };

  return (
    <Card 
      className="hover-elevate cursor-pointer" 
      onClick={() => onViewDetails?.(run.id)}
      data-testid={`card-eval-run-${run.id}`}
    >
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="space-y-1">
          <CardTitle className="text-base">{run.suiteName}</CardTitle>
          <p className="text-sm text-muted-foreground font-mono">
            Run: {run.id.substring(0, 8)}...
          </p>
        </div>
        <StatusBadge status={run.status} size="sm" />
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <p className="text-xs text-muted-foreground mb-1">Prompt Version</p>
          <Badge variant="secondary">{run.promptVersion}</Badge>
        </div>

        <div className="flex flex-wrap gap-1">
          {run.providers.map((provider) => (
            <Badge key={provider} variant="outline" className="text-xs">
              {provider}
            </Badge>
          ))}
        </div>

        {run.stats && (
          <div className="grid grid-cols-2 gap-3 pt-3 border-t">
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <CheckCircle2 className="h-3 w-3" />
                <span className="text-xs">Pass Rate</span>
              </div>
              <p className="text-lg font-medium">{run.stats.passRate}%</p>
            </div>
            <div>
              <div className="flex items-center gap-1 text-muted-foreground mb-1">
                <Clock className="h-3 w-3" />
                <span className="text-xs">Avg Latency</span>
              </div>
              <p className="text-lg font-medium">{run.stats.avgLatencyMs}ms</p>
            </div>
          </div>
        )}

        {run.costCents !== undefined && (
          <div className="flex items-center justify-between text-sm pt-2 border-t">
            <div className="flex items-center gap-1 text-muted-foreground">
              <DollarSign className="h-3 w-3" />
              <span className="text-xs">Total Cost</span>
            </div>
            <span className="font-medium">${(run.costCents / 100).toFixed(2)}</span>
          </div>
        )}

        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2"
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails?.(run.id);
          }}
          data-testid={`button-view-run-${run.id}`}
        >
          View Details
        </Button>
      </CardContent>
    </Card>
  );
}
