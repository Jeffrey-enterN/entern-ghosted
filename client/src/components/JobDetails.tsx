import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { JobDetails as JobDetailsType, CompanyStats } from "@shared/schema";

interface JobDetailsProps {
  jobDetails: JobDetailsType;
  companyStats?: CompanyStats;
  isLoading: boolean;
  onReportClick: () => void;
  onDetailsClick: () => void;
}

export default function JobDetails({ 
  jobDetails, 
  companyStats, 
  isLoading, 
  onReportClick, 
  onDetailsClick 
}: JobDetailsProps) {
  // Determine ghosting rate class based on percentage
  const getGhostingRateClass = (rate?: number) => {
    if (!rate) return "ghost-rating-0";
    if (rate < 20) return "ghost-rating-0";
    if (rate < 50) return "ghost-rating-1";
    return "ghost-rating-2";
  };

  const ghostingRateClass = getGhostingRateClass(companyStats?.ghostingRate);

  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-gray-800">{jobDetails.title}</h2>
        {isLoading ? (
          <Skeleton className="h-6 w-24" />
        ) : (
          companyStats && (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ghostingRateClass}`}>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              {companyStats.ghostingRate}% ghosting rate
            </span>
          )
        )}
      </div>
      <div className="mt-1 text-sm text-gray-600">{jobDetails.company}</div>
      {jobDetails.location && (
        <div className="mt-1 text-sm text-gray-500">{jobDetails.location}</div>
      )}
      
      <div className="mt-4 flex items-center justify-between">
        <Button 
          className="inline-flex items-center px-3 py-2 text-sm"
          variant="default"
          onClick={onReportClick}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM7 9H5v2h2V9zm8 0h-2v2h2V9zM9 9h2v2H9V9z" clipRule="evenodd" />
          </svg>
          Report Ghosting
        </Button>
        <Button 
          className="inline-flex items-center px-3 py-2 text-sm"
          variant="outline"
          onClick={onDetailsClick}
          disabled={isLoading || !companyStats}
        >
          View Details
        </Button>
      </div>
      
      {isLoading && (
        <Card className="mt-4">
          <CardContent className="p-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-4 w-5/6" />
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
