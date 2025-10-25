import { JobsTable, Job } from '../JobsTable';

export default function JobsTableExample() {
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
      attempts: 1,
      maxAttempts: 5,
    },
  ];

  return (
    <div className="p-4">
      <JobsTable jobs={mockJobs} />
    </div>
  );
}
