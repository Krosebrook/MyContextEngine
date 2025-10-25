import { StatusBadge } from '../StatusBadge';

export default function StatusBadgeExample() {
  return (
    <div className="p-4 flex flex-wrap gap-2">
      <StatusBadge status="queued" />
      <StatusBadge status="running" />
      <StatusBadge status="succeeded" />
      <StatusBadge status="failed" />
      <StatusBadge status="canceled" />
    </div>
  );
}
