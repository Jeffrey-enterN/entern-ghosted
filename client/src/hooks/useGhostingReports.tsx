import { useEffect, useState } from "react";
import { useGhostGuard } from "@/context/GhostGuardContext";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import type { GhostingStage, InsertGhostingReport } from "@shared/schema";

export function useGhostingReports() {
  const { submitterId, currentJob, refreshData } = useGhostGuard();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const submitReport = async (reportData: {
    stage: GhostingStage;
    date: Date;
    details?: string;
    shareContact: boolean;
  }) => {
    if (!currentJob) {
      setSubmitError("No job selected. Please select a job listing first.");
      return false;
    }

    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const report: InsertGhostingReport = {
        employerId: currentJob.employerId,
        jobListingId: currentJob.id,
        submitterId,
        stage: reportData.stage,
        date: reportData.date,
        details: reportData.details || "",
        shareContact: reportData.shareContact
      };

      await apiRequest("POST", "/api/reports", report);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: [`/api/job-listings/${currentJob.id}`] });
      queryClient.invalidateQueries({ queryKey: [`/api/employers/${currentJob.employerId}`] });
      
      // Refresh context data
      refreshData();
      
      return true;
    } catch (error) {
      console.error("Error submitting report:", error);
      setSubmitError("Failed to submit report. Please try again.");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    submitError,
    submitReport
  };
}
