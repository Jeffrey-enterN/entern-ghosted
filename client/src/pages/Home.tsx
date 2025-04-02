import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import JobDetails from "@/components/JobDetails";
import CompanyDetails from "@/components/CompanyDetails";
import GhostingForm from "@/components/GhostingForm";
import NoJobDetected from "@/components/NoJobDetected";
import SuccessMessage from "@/components/SuccessMessage";
import { getJobDetails } from "@/lib/extensionApi";
import { JobDetails as JobDetailsType } from "@shared/schema";

type ViewState = "job" | "form" | "company" | "success" | "empty";

export default function Home() {
  const [jobDetails, setJobDetails] = useState<JobDetailsType | null>(null);
  const [viewState, setViewState] = useState<ViewState>("empty");
  
  // Query for company stats if we have job details
  const { data: companyStats, isLoading } = useQuery({
    queryKey: jobDetails ? ['/api/companies/stats', jobDetails.company] : null,
    queryFn: () => fetch(`/api/companies/stats?name=${encodeURIComponent(jobDetails!.company)}`).then(res => {
      if (!res.ok && res.status !== 404) throw new Error("Failed to get company stats");
      return res.json();
    }),
    enabled: !!jobDetails,
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
    setViewState("company");
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
