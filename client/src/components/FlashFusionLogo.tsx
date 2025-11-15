import { Zap } from "lucide-react";

interface FlashFusionLogoProps {
  size?: "sm" | "md" | "lg";
  variant?: "full" | "icon";
  className?: string;
}

export function FlashFusionLogo({ size = "md", variant = "full", className = "" }: FlashFusionLogoProps) {
  const sizeClasses = {
    sm: {
      text: "text-lg",
      icon: "h-5 w-5",
    },
    md: {
      text: "text-2xl",
      icon: "h-7 w-7",
    },
    lg: {
      text: "text-4xl",
      icon: "h-10 w-10",
    },
  };

  const currentSize = sizeClasses[size];

  if (variant === "icon") {
    return (
      <div className={`inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-accent p-2 ${className}`}>
        <Zap className={`${currentSize.icon} text-primary-foreground fill-primary-foreground`} />
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 ${className}`}>
      <div className="inline-flex items-center justify-center rounded-lg bg-gradient-to-br from-primary via-primary to-accent p-1.5">
        <Zap className={`${currentSize.icon} text-primary-foreground fill-primary-foreground`} />
      </div>
      <span className={`${currentSize.text} font-bold tracking-tight bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent`}>
        FlashFusion
      </span>
    </div>
  );
}
