import { motion, useReducedMotion } from "framer-motion";
import { Upload, FileText, Sparkles, CheckCircle2, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileProcessingProgressProps {
  status: "uploaded" | "pending" | "extracted" | "analyzed" | "failed";
  fileName: string;
}

const stages = [
  { key: "uploaded", label: "Uploaded", icon: Upload, color: "text-blue-500" },
  { key: "extracted", label: "Extracting Text", icon: FileText, color: "text-purple-500" },
  { key: "analyzed", label: "AI Analysis Complete", icon: Sparkles, color: "text-green-500" },
] as const;

export function FileProcessingProgress({ status, fileName }: FileProcessingProgressProps) {
  const shouldReduceMotion = useReducedMotion();
  
  // Handle pending status (scanner imports)
  const effectiveStatus = status === "pending" ? "uploaded" : status;
  
  // Handle failure status
  const isFailed = effectiveStatus === "failed";
  
  // Find current stage, default to 0 for unknown statuses
  const currentStageIndex = isFailed ? -1 : stages.findIndex((s) => s.key === effectiveStatus);
  const safeStageIndex = currentStageIndex === -1 ? 0 : currentStageIndex;
  
  const isComplete = effectiveStatus === "analyzed";
  const progress = isFailed ? 100 : isComplete ? 100 : ((safeStageIndex + 1) / stages.length) * 100;

  return (
    <div className="space-y-4" data-testid={`progress-${fileName}`}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium truncate flex-1 mr-4">{fileName}</span>
        <span className="text-muted-foreground">{Math.round(progress)}%</span>
      </div>

      {/* Progress bar */}
      <div className="relative h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn(
            "absolute inset-y-0 left-0 rounded-full",
            isFailed
              ? "bg-red-500"
              : isComplete
              ? "bg-gradient-to-r from-green-500 to-emerald-500"
              : "bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500"
          )}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: shouldReduceMotion ? 0 : 0.8, ease: "easeOut" }}
        />
        {!isComplete && !isFailed && !shouldReduceMotion && (
          <motion.div
            className="absolute inset-y-0 left-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent"
            animate={{ x: ["0%", "400%"] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Stage indicators or failure message */}
      {isFailed ? (
        <div className="flex items-center justify-center gap-2 p-3 rounded-md bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <XCircle className="h-5 w-5 text-red-600 flex-shrink-0" />
          <span className="text-sm text-red-900 dark:text-red-100">
            Processing failed - please try uploading again
          </span>
        </div>
      ) : (
        <div className="flex items-center justify-between gap-2">
          {stages.map((stage, idx) => {
            const isActive = idx <= safeStageIndex;
            const isCurrent = idx === safeStageIndex && !isComplete;
            const StageIcon = stage.icon;

            return (
              <div key={stage.key} className="flex flex-col items-center gap-1 flex-1">
                <motion.div
                  className={cn(
                    "flex items-center justify-center h-8 w-8 rounded-full border-2 transition-colors",
                    isActive
                      ? `${stage.color} bg-background border-current`
                      : "border-muted text-muted-foreground"
                  )}
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{
                    scale: isCurrent && !shouldReduceMotion ? [1, 1.1, 1] : 1,
                    opacity: 1,
                  }}
                  transition={{
                    scale: isCurrent && !shouldReduceMotion
                      ? { duration: 1, repeat: Infinity }
                      : { duration: 0.3 },
                    opacity: { duration: 0.3, delay: shouldReduceMotion ? 0 : idx * 0.1 },
                  }}
                >
                  {isComplete && idx === stages.length - 1 ? (
                    <CheckCircle2 className="h-4 w-4" />
                  ) : (
                    <StageIcon className="h-4 w-4" />
                  )}
                </motion.div>
                <span
                  className={cn(
                    "text-xs text-center transition-colors",
                    isActive ? stage.color : "text-muted-foreground"
                  )}
                >
                  {stage.label}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
