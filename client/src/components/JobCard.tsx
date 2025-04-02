import { type JobListingWithStats } from "@shared/schema";
import RatingIndicator from "./RatingIndicator";
import { useGhostGuard } from "@/context/GhostGuardContext";

interface JobCardProps {
  job: JobListingWithStats;
  isCurrentJob?: boolean;
  showActions?: boolean;
}

const JobCard = ({ job, isCurrentJob = false, showActions = false }: JobCardProps) => {
  const { setActiveTab } = useGhostGuard();

  const handleReportClick = () => {
    setActiveTab("newReport");
  };

  return (
    <div className={`bg-white rounded-lg border border-slate-200 p-${isCurrentJob ? '4' : '3'} mb-3 shadow-sm`}>
      {isCurrentJob ? (
        <div className="flex items-start">
          <div className="flex-shrink-0 mr-3 mt-1">
            <i className="ri-radar-line text-primary text-lg"></i>
          </div>
          <div>
            <h2 className="font-medium text-sm">{job.title}</h2>
            <p className="text-slate-500 text-sm">{job.employer.name}</p>
            
            <div className="mt-2">
              <div className="flex items-center mb-1">
                <span className="text-xs font-medium text-slate-700 mr-1">Ghosting Score:</span>
                <span className={`bg-${job.ghostingScore >= 0.6 ? 'success' : job.ghostingScore >= 0.4 ? 'warning' : 'danger'} text-white text-xs font-medium px-2 py-0.5 rounded`}>
                  {job.rating}
                </span>
              </div>
              <RatingIndicator score={job.ghostingScore} size="lg" />
              <p className="text-xs text-slate-500 mt-1">
                <span className="font-medium">{job.reportCount} reports</span> from {job.applicantCount} applicants
              </p>
            </div>
            
            {showActions && (
              <div className="mt-2 flex">
                <button className="text-xs bg-primary hover:bg-primary-hover text-white font-medium py-1 px-3 rounded-md mr-2">
                  View Details
                </button>
                <button 
                  onClick={handleReportClick}
                  className="text-xs bg-slate-200 hover:bg-slate-300 text-slate-700 font-medium py-1 px-3 rounded-md"
                >
                  Report Experience
                </button>
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="flex justify-between">
          <div>
            <h3 className="font-medium text-sm">{job.title}</h3>
            <p className="text-slate-500 text-xs">{job.employer.name}</p>
          </div>
          <div>
            <RatingIndicator score={job.ghostingScore} showText={true} />
          </div>
        </div>
      )}
    </div>
  );
};

export default JobCard;
