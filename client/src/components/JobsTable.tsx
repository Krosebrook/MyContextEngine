import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./StatusBadge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, Play, StopCircle, RotateCcw } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";

export interface Job {
  id: string;
  kind: string;
  status: "queued" | "running" | "succeeded" | "failed" | "canceled";
  priority: number;
  scheduledAt: string;
  startedAt?: string;
  finishedAt?: string;
  attempts: number;
  maxAttempts: number;
  error?: string;
}

interface JobsTableProps {
  jobs: Job[];
  onViewDetails?: (id: string) => void;
  onRetry?: (id: string) => void;
  onCancel?: (id: string) => void;
}

export function JobsTable({ jobs, onViewDetails, onRetry, onCancel }: JobsTableProps) {
  const formatDate = (date: string) => {
    return new Date(date).toLocaleString();
  };

  return (
    <div className="border rounded-md">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[200px]">ID</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Scheduled</TableHead>
            <TableHead>Attempts</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {jobs.map((job) => (
            <TableRow 
              key={job.id}
              className="hover-elevate cursor-pointer"
              onClick={() => onViewDetails?.(job.id)}
              data-testid={`row-job-${job.id}`}
            >
              <TableCell className="font-mono text-sm" data-testid={`text-job-id-${job.id}`}>
                {job.id.substring(0, 8)}...
              </TableCell>
              <TableCell>
                <Badge variant="secondary">{job.kind}</Badge>
              </TableCell>
              <TableCell>
                <StatusBadge status={job.status} />
              </TableCell>
              <TableCell>{job.priority}</TableCell>
              <TableCell className="text-sm text-muted-foreground">
                {formatDate(job.scheduledAt)}
              </TableCell>
              <TableCell>
                <span className="text-sm">
                  {job.attempts}/{job.maxAttempts}
                </span>
              </TableCell>
              <TableCell className="text-right">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      data-testid={`button-actions-${job.id}`}
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={(e) => {
                      e.stopPropagation();
                      onViewDetails?.(job.id);
                    }}>
                      <Play className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    {(job.status === "failed" || job.status === "canceled") && (
                      <DropdownMenuItem onClick={(e) => {
                        e.stopPropagation();
                        onRetry?.(job.id);
                        console.log('Retry job:', job.id);
                      }}>
                        <RotateCcw className="h-4 w-4 mr-2" />
                        Retry
                      </DropdownMenuItem>
                    )}
                    {(job.status === "queued" || job.status === "running") && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={(e) => {
                            e.stopPropagation();
                            onCancel?.(job.id);
                            console.log('Cancel job:', job.id);
                          }}
                          className="text-destructive"
                        >
                          <StopCircle className="h-4 w-4 mr-2" />
                          Cancel
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
