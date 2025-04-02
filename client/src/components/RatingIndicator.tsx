import { cn } from "@/lib/utils";

interface RatingIndicatorProps {
  score: number;
  showText?: boolean;
  showScore?: boolean;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const RatingIndicator = ({ 
  score, 
  showText = false, 
  showScore = false,
  size = "md",
  className
}: RatingIndicatorProps) => {
  // Get rating level (1-5) based on score (0-1)
  const ratingLevel = Math.max(1, Math.min(5, Math.ceil(score * 5)));
  
  // Determine text label
  let ratingText = "";
  let textColorClass = "";
  
  if (ratingLevel === 5) {
    ratingText = "Excellent";
    textColorClass = "text-success";
  } else if (ratingLevel === 4) {
    ratingText = "Good";
    textColorClass = "text-success";
  } else if (ratingLevel === 3) {
    ratingText = "Moderate";
    textColorClass = "text-warning";
  } else if (ratingLevel === 2) {
    ratingText = "Poor";
    textColorClass = "text-warning";
  } else {
    ratingText = "Very Poor";
    textColorClass = "text-danger";
  }
  
  // Set width based on size prop
  const widthClass = size === "sm" ? "w-16" : size === "lg" ? "w-full" : "w-20";
  
  return (
    <div className={className}>
      <div className={cn("rating-indicator h-1.5 rounded overflow-hidden bg-slate-200", widthClass)}>
        <div 
          className={`rating-bar h-full ${
            ratingLevel === 5 ? "bg-success" : 
            ratingLevel === 4 ? "bg-success" : 
            ratingLevel === 3 ? "bg-warning" : 
            ratingLevel === 2 ? "bg-warning" : 
            "bg-danger"
          }`} 
          style={{ width: `${ratingLevel * 20}%` }}
        ></div>
      </div>
      
      {(showText || showScore) && (
        <p className="text-xs text-slate-500 mt-1">
          {showScore && (
            <span className={`font-medium ${textColorClass}`}>
              {(score * 5).toFixed(1)}
            </span>
          )}
          {showText && showScore && " - "}
          {showText && (
            <span className={`font-medium ${textColorClass}`}>
              {ratingText}
            </span>
          )}
        </p>
      )}
    </div>
  );
};

export default RatingIndicator;
