import { Badge } from "@/components/ui/badge";
import { Clock, CheckCircle2, XCircle, Loader2, BanIcon } from "lucide-react";

type Status = "queued" | "running" | "succeeded" | "failed" | "canceled";

interface StatusBadgeProps {
  status: Status;
  size?: "sm" | "default";
}

const statusConfig: Record<Status, { label: string; icon: typeof Clock; className: string }> = {
  queued: {
    label: "Queued",
    icon: Clock,
    className: "bg-muted text-muted-foreground border-muted-border",
  },
  running: {
    label: "Running",
    icon: Loader2,
    className: "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  succeeded: {
    label: "Succeeded",
    icon: CheckCircle2,
    className: "bg-green-100 text-green-800 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  failed: {
    label: "Failed",
    icon: XCircle,
    className: "bg-red-100 text-red-800 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  canceled: {
    label: "Canceled",
    icon: BanIcon,
    className: "bg-gray-100 text-gray-800 border-gray-200 dark:bg-gray-900 dark:text-gray-300 dark:border-gray-700",
  },
};

export function StatusBadge({ status, size = "default" }: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const isRunning = status === "running";

  return (
    <Badge 
      variant="outline" 
      className={`${config.className} ${size === "sm" ? "text-xs" : ""}`}
      data-testid={`status-${status}`}
    >
      <Icon className={`h-3 w-3 mr-1 ${isRunning ? "animate-spin" : ""}`} />
      {config.label}
    </Badge>
  );
}
