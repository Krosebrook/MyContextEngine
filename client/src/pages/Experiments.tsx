import { EvaluationRunCard, EvalRun } from "@/components/EvaluationRunCard";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Experiments() {
  const mockRuns: EvalRun[] = [
    {
      id: "run-001-abc-def",
      suiteName: "Product Classification",
      promptVersion: "v2.3",
      status: "running",
      startedAt: new Date(Date.now() - 1800000).toISOString(),
      providers: ["gemini-2.0-flash", "claude-3.7-sonnet"],
      stats: {
        totalSamples: 150,
        passRate: 92,
        avgLatencyMs: 850,
      },
      costCents: 45,
    },
    {
      id: "run-002-xyz-uvw",
      suiteName: "Sentiment Analysis",
      promptVersion: "v1.8",
      status: "succeeded",
      startedAt: new Date(Date.now() - 7200000).toISOString(),
      finishedAt: new Date(Date.now() - 3600000).toISOString(),
      providers: ["gpt-4o", "claude-3.7-haiku"],
      stats: {
        totalSamples: 500,
        passRate: 96,
        avgLatencyMs: 420,
      },
      costCents: 125,
    },
    {
      id: "run-003-lmn-opq",
      suiteName: "Code Generation",
      promptVersion: "v3.1",
      status: "failed",
      startedAt: new Date(Date.now() - 14400000).toISOString(),
      finishedAt: new Date(Date.now() - 12000000).toISOString(),
      providers: ["gemini-1.5-pro"],
      stats: {
        totalSamples: 75,
        passRate: 68,
        avgLatencyMs: 1250,
      },
      costCents: 89,
    },
  ];

  const suites = [
    { name: "Product Classification", mode: "offline", metrics: 3, runs: 12 },
    { name: "Sentiment Analysis", mode: "online", metrics: 2, runs: 8 },
    { name: "Code Generation", mode: "offline", metrics: 4, runs: 5 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-medium">Experiments</h1>
          <p className="text-muted-foreground mt-1">
            Run and analyze AI model evaluations
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" data-testid="button-create-suite">
            Create Suite
          </Button>
          <Button data-testid="button-create-run">
            <Plus className="h-4 w-4 mr-2" />
            New Run
          </Button>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Evaluation Suites</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {suites.map((suite) => (
            <Card 
              key={suite.name} 
              className="hover-elevate cursor-pointer"
              data-testid={`card-suite-${suite.name.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{suite.name}</CardTitle>
                  <Badge variant="secondary" className="text-xs">
                    {suite.mode}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Metrics</span>
                    <span className="font-medium">{suite.metrics}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total Runs</span>
                    <span className="font-medium">{suite.runs}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <div>
        <h2 className="text-xl font-medium mb-4">Recent Runs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {mockRuns.map((run) => (
            <EvaluationRunCard
              key={run.id}
              run={run}
              onViewDetails={(id) => console.log('View run:', id)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
