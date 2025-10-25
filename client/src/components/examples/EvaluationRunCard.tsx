import { EvaluationRunCard, EvalRun } from '../EvaluationRunCard';

export default function EvaluationRunCardExample() {
  const mockRun: EvalRun = {
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
  };

  return (
    <div className="p-4 max-w-sm">
      <EvaluationRunCard run={mockRun} />
    </div>
  );
}
