import { MetricCard } from '../MetricCard';
import { Briefcase } from 'lucide-react';

export default function MetricCardExample() {
  return (
    <div className="p-4 space-y-4">
      <MetricCard
        title="Total Jobs"
        value="247"
        icon={Briefcase}
        trend={{ value: 12, isPositive: true }}
      />
    </div>
  );
}
