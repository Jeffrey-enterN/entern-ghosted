import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CompanyStats } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface CompanyDetailsProps {
  companyStats: CompanyStats;
  onBackClick: () => void;
}

export default function CompanyDetails({ companyStats, onBackClick }: CompanyDetailsProps) {
  // Determine ghosting rate class based on percentage
  const getGhostingRateClass = (rate: number) => {
    if (rate < 20) return "ghost-rating-0";
    if (rate < 50) return "ghost-rating-1";
    return "ghost-rating-2";
  };
  
  // Get bar color based on percentage
  const getBarColor = (value: number) => {
    if (value < 20) return "bg-green-500";
    if (value < 50) return "bg-yellow-500";
    return "bg-red-500";
  };
  
  const ghostingRateClass = getGhostingRateClass(companyStats.ghostingRate);

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">{companyStats.name}</h3>
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ghostingRateClass}`}>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
          {companyStats.ghostingRate}% ghosting rate
        </span>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">Ghosting by Stage</h4>
        <div className="mt-2 space-y-2">
          {Object.entries(companyStats.stageBreakdown).map(([stage, percentage]) => (
            <div key={stage} className="flex items-center justify-between">
              <span className="text-sm text-gray-500">{stage}</span>
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div className={`${getBarColor(percentage)} h-2.5 rounded-full`} style={{ width: `${percentage}%` }}></div>
              </div>
              <span className="text-sm text-gray-500">{percentage}%</span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4">
        <h4 className="text-sm font-medium text-gray-900">Recent Reports</h4>
        <div className="mt-2 space-y-3">
          {companyStats.recentReports.map(report => (
            <div key={report.id} className="bg-gray-50 p-3 rounded-md">
              <div className="flex justify-between">
                <span className="text-xs font-medium text-gray-500">{report.applicationStage}</span>
                <span className="text-xs text-gray-400">
                  {formatDistanceToNow(new Date(report.reportDate), { addSuffix: true })}
                </span>
              </div>
              {report.details && (
                <p className="mt-1 text-sm text-gray-600">{report.details}</p>
              )}
            </div>
          ))}
          
          {companyStats.recentReports.length === 0 && (
            <div className="text-center py-4 text-gray-500 text-sm">
              No reports yet
            </div>
          )}
        </div>
      </div>
      
      <div className="mt-4 flex justify-end">
        <Button
          className="inline-flex items-center px-3 py-2 text-sm"
          onClick={onBackClick}
        >
          Back to Job
        </Button>
      </div>
    </div>
  );
}
