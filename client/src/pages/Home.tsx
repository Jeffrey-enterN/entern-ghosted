import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import JobDetails from "@/components/JobDetails";
import CompanyDetails from "@/components/CompanyDetails";
import GhostingForm from "@/components/GhostingForm";
import NoJobDetected from "@/components/NoJobDetected";
import SuccessMessage from "@/components/SuccessMessage";
import LoadingPage from "@/components/LoadingPage";
import { getJobDetails } from "@/lib/extensionApi";
import { JobDetails as JobDetailsType } from "@shared/schema";

type ViewState = "job" | "form" | "company" | "success" | "empty";

export default function Home() {
  const [jobDetails, setJobDetails] = useState<JobDetailsType | null>(null);
  const [viewState, setViewState] = useState<ViewState>("empty");
  
  // Query for company stats if we have job details
  const { data: companyStats, isLoading, error } = useQuery({
    queryKey: ['/api/companies/stats', jobDetails?.company || ''],
    queryFn: async () => {
      const res = await fetch(`/api/companies/stats?name=${encodeURIComponent(jobDetails!.company)}`);
      if (!res.ok) {
        // If it's a 404, return a default company stats object
        if (res.status === 404) {
          return {
            companyId: 0,
            companyName: jobDetails!.company,
            ghostingRate: 0,
            totalReports: 0,
            stageBreakdown: {},
            recentReports: []
          };
        }
        throw new Error("Failed to get company stats");
      }
      return res.json();
    },
    enabled: !!jobDetails, // Only run query if we have job details
  });

  useEffect(() => {
    // Get job details from the extension
    const loadJobDetails = async () => {
      try {
        const details = await getJobDetails();
        if (details) {
          setJobDetails(details);
          setViewState("job");
        } else {
          setViewState("empty");
        }
      } catch (error) {
        console.error("Error loading job details:", error);
        setViewState("empty");
      }
    };
    
    loadJobDetails();
  }, []);

  const handleOpenForm = () => {
    setViewState("form");
  };

  const handleViewDetails = () => {
    // Only navigate to company details if we have company stats
    if (companyStats) {
      setViewState("company");
    }
  };

  const handleBackToJob = () => {
    setViewState("job");
  };

  const handleSubmitSuccess = () => {
    setViewState("success");
    // Auto revert to job view after showing success message
    setTimeout(() => {
      setViewState("job");
    }, 3000);
  };

  // Loading state while fetching company data
  if (viewState === "job" && jobDetails && isLoading) {
    return <LoadingPage message="Checking ghosting data..." />;
  }
  
  return (
    <div>
      {viewState === "empty" && <NoJobDetected />}
      
      {viewState === "job" && jobDetails && (
        <JobDetails 
          jobDetails={jobDetails}
          companyStats={companyStats}
          isLoading={isLoading}
          onReportClick={handleOpenForm}
          onDetailsClick={handleViewDetails}
        />
      )}
      
      {viewState === "form" && jobDetails && (
        <GhostingForm 
          jobDetails={jobDetails}
          onCancel={handleBackToJob}
          onSuccess={handleSubmitSuccess}
        />
      )}
      
      {viewState === "company" && companyStats && (
        <CompanyDetails 
          companyStats={companyStats}
          onBackClick={handleBackToJob}
        />
      )}
      
      {viewState === "success" && (
        <SuccessMessage 
          message="Thank you for contributing to the community. Your report will help other job seekers."
          onDismiss={handleBackToJob}
        />
      )}
    </div>
  );
}
