import { type EmployerWithStats } from "@shared/schema";
import RatingIndicator from "./RatingIndicator";
import { getInitials } from "@/lib/utils";

interface EmployerCardProps {
  employer: EmployerWithStats;
}

const EmployerCard = ({ employer }: EmployerCardProps) => {
  const normalizedRating = employer.averageRating / 5; // Convert to 0-1 scale
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 mb-2 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-8 h-8 bg-primary-light rounded-full flex items-center justify-center text-white font-medium text-xs mr-2">
            {getInitials(employer.name)}
          </div>
          <div>
            <h3 className="font-medium text-sm">{employer.name}</h3>
            <div className="flex items-center">
              <RatingIndicator score={normalizedRating} showScore={true} />
            </div>
          </div>
        </div>
        <span className="text-xs text-slate-500">{employer.reportCount} reports</span>
      </div>
    </div>
  );
};

export default EmployerCard;
