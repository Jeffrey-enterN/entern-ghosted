import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

type GhostRatingLevel = "low" | "medium" | "high";

interface GhostRatingProps {
  rate: number;
  showIcon?: boolean;
  className?: string;
}

export default function GhostRating({ rate, showIcon = true, className }: GhostRatingProps) {
  let level: GhostRatingLevel = "low";
  let Icon = CheckCircle;
  
  if (rate >= 70) {
    level = "high";
    Icon = AlertCircle;
  } else if (rate >= 40) {
    level = "medium";
    Icon = AlertTriangle;
  }
  
  return (
    <span className={cn(`ghost-rating ghost-${level} flex items-center`, className)}>
      {showIcon && <Icon className="w-4 h-4 mr-1" />}
      {rate}% Ghosted
    </span>
  );
}
