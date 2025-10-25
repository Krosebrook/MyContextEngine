import { JobProgressBar } from '../JobProgressBar';

export default function JobProgressBarExample() {
  const stats = {
    queued: 45,
    running: 12,
    succeeded: 234,
    failed: 8,
    skipped: 3,
  };

  return (
    <div className="p-4">
      <JobProgressBar stats={stats} />
    </div>
  );
}
