import { type GhostingReportWithDetails } from "@shared/schema";
import { formatDate } from "@/lib/utils";

interface ReportCardProps {
  report: GhostingReportWithDetails;
}

const ReportCard = ({ report }: ReportCardProps) => {
  // Determine the stage indicator color
  const getStageColor = (stage: string) => {
    switch (stage) {
      case "application": return "bg-slate-500";
      case "screening": return "bg-warning";
      case "interview": return "bg-danger";
      case "assessment": return "bg-danger";
      case "offer": return "bg-danger";
      default: return "bg-slate-500";
    }
  };
  
  // Get human-readable stage text
  const getStageText = (stage: string) => {
    switch (stage) {
      case "application": return "Ghosted after application";
      case "screening": return "Ghosted after screening";
      case "interview": return "Ghosted after interview";
      case "assessment": return "Ghosted after assessment";
      case "offer": return "Ghosted after offer discussion";
      default: return "Ghosted";
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-slate-200 p-3 shadow-sm">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-medium text-sm">{report.jobListing?.title || "Unknown Position"}</h3>
          <p className="text-slate-500 text-xs">{report.employer.name}</p>
        </div>
        <span className="text-xs text-slate-400">{formatDate(report.date)}</span>
      </div>
      
      {report.details && (
        <div className="text-xs text-slate-600 mb-3">
          <p>{report.details}</p>
        </div>
      )}
      
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <span className={`inline-block w-2 h-2 rounded-full ${getStageColor(report.stage)} mr-1`}></span>
          <span className="text-xs font-medium text-slate-600">
            {getStageText(report.stage)}
          </span>
        </div>
        <button className="text-xs text-slate-400 hover:text-slate-600">
          <i className="ri-more-fill"></i>
        </button>
      </div>
    </div>
  );
};

export default ReportCard;
