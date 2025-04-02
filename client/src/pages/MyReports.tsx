import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { getExtensionInfo } from "@/lib/extensionApi";
import { GhostingReport } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

export default function MyReports() {
  const [reporterId, setReporterId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    const loadReporterId = async () => {
      try {
        const info = await getExtensionInfo();
        setReporterId(info.reporterId || null);
      } catch (error) {
        console.error("Error loading reporter ID:", error);
        toast({
          title: "Error",
          description: "Failed to load your identity. Please try again.",
          variant: "destructive",
        });
      }
    };

    loadReporterId();
  }, [toast]);

  const { data: reports, isLoading, error } = useQuery({
    queryKey: reporterId ? ['/api/reporters', reporterId, 'reports'] : null,
    queryFn: () => 
      fetch(`/api/reporters/${reporterId}/reports`)
        .then(res => {
          if (!res.ok) throw new Error("Failed to fetch reports");
          return res.json();
        }),
    enabled: !!reporterId,
  });

  function getGhostingRatingClass(stage: string): string {
    if (stage.includes("Final") || stage.includes("Verbal Offer")) {
      return "bg-red-100 text-red-800";
    } else if (stage.includes("Interview")) {
      return "bg-amber-100 text-amber-800";
    } else {
      return "bg-green-100 text-green-800";
    }
  }

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">My Ghosting Reports</h2>
      
      {isLoading && (
        <div className="flex items-center justify-center p-8">
          <svg className="animate-spin h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
      )}

      {error && (
        <Card className="mb-4">
          <CardContent className="p-4">
            <div className="text-center text-red-600">
              Failed to load your reports. Please try again later.
            </div>
          </CardContent>
        </Card>
      )}

      {!isLoading && reports && reports.length === 0 && (
        <Card className="mb-4">
          <CardContent className="p-4 text-center">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-gray-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <p className="text-gray-600">You haven't submitted any ghosting reports yet.</p>
          </CardContent>
        </Card>
      )}

      {!isLoading && reports && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report: GhostingReport) => (
            <Card key={report.id} className="overflow-hidden">
              <div className="bg-white p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-gray-900">{report.jobTitle}</h3>
                    <p className="text-sm text-gray-600">
                      {/* We would need to query company name by ID in real implementation */}
                      Company ID: {report.companyId}
                    </p>
                  </div>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getGhostingRatingClass(report.applicationStage)}`}>
                    {report.applicationStage}
                  </span>
                </div>
                <Separator className="my-2" />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>{new Date(report.reportDate).toLocaleDateString()}</span>
                  <span>{report.jobBoard}</span>
                </div>
                {report.details && (
                  <p className="mt-2 text-sm text-gray-600">{report.details}</p>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
