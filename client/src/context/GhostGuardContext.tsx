import React, { createContext, useContext, useState, useEffect } from "react";
import { generateSubmitterId } from "@/lib/utils";
import { type JobListingWithStats, type GhostingReportWithDetails, type EmployerWithStats } from "@shared/schema";
import { useJobDetection } from "@/hooks/useJobDetection";

interface GhostGuardContextType {
  activeTab: "home" | "reports" | "newReport";
  setActiveTab: (tab: "home" | "reports" | "newReport") => void;
  submitterId: string;
  currentSite: string;
  currentJob: JobListingWithStats | null;
  setCurrentJob: (job: JobListingWithStats | null) => void;
  recentJobs: JobListingWithStats[];
  setRecentJobs: (jobs: JobListingWithStats[]) => void;
  userReports: GhostingReportWithDetails[];
  setUserReports: (reports: GhostingReportWithDetails[]) => void;
  topEmployers: EmployerWithStats[];
  setTopEmployers: (employers: EmployerWithStats[]) => void;
  refreshData: () => void;
}

const GhostGuardContext = createContext<GhostGuardContextType | undefined>(undefined);

export const GhostGuardProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<"home" | "reports" | "newReport">("home");
  const [submitterId] = useState<string>(() => generateSubmitterId());
  const [currentSite, setCurrentSite] = useState<string>("Job Board");
  const [currentJob, setCurrentJob] = useState<JobListingWithStats | null>(null);
  const [recentJobs, setRecentJobs] = useState<JobListingWithStats[]>([]);
  const [userReports, setUserReports] = useState<GhostingReportWithDetails[]>([]);
  const [topEmployers, setTopEmployers] = useState<EmployerWithStats[]>([]);

  // Current site detection
  useEffect(() => {
    // Simple detection of the current job board
    const hostname = window.location.hostname;
    if (hostname.includes("linkedin")) {
      setCurrentSite("LinkedIn");
    } else if (hostname.includes("indeed")) {
      setCurrentSite("Indeed");
    } else if (hostname.includes("ziprecruiter")) {
      setCurrentSite("ZipRecruiter");
    } else if (hostname.includes("monster")) {
      setCurrentSite("Monster");
    } else {
      setCurrentSite("Job Board");
    }
  }, []);

  // Job detection hook
  useJobDetection();

  // Fetch initial data
  useEffect(() => {
    refreshData();
  }, [submitterId]);

  const refreshData = async () => {
    try {
      // Fetch user reports
      const reportsRes = await fetch(`/api/reports?submitterId=${submitterId}`);
      if (reportsRes.ok) {
        const reportsData = await reportsRes.json();
        setUserReports(reportsData);
      }

      // Fetch recent jobs
      const recentJobsRes = await fetch(`/api/job-listings/recent?limit=3`);
      if (recentJobsRes.ok) {
        const jobsData = await recentJobsRes.json();
        setRecentJobs(jobsData);
      }

      // Fetch top employers
      const topEmployersRes = await fetch(`/api/employers/top?limit=5`);
      if (topEmployersRes.ok) {
        const employersData = await topEmployersRes.json();
        setTopEmployers(employersData);
      }
    } catch (error) {
      console.error("Error refreshing data:", error);
    }
  };

  const value = {
    activeTab,
    setActiveTab,
    submitterId,
    currentSite,
    currentJob,
    setCurrentJob,
    recentJobs,
    setRecentJobs,
    userReports,
    setUserReports,
    topEmployers,
    setTopEmployers,
    refreshData,
  };

  return <GhostGuardContext.Provider value={value}>{children}</GhostGuardContext.Provider>;
};

export const useGhostGuard = (): GhostGuardContextType => {
  const context = useContext(GhostGuardContext);
  if (context === undefined) {
    throw new Error("useGhostGuard must be used within a GhostGuardProvider");
  }
  return context;
};

// This context and provider were initially named GhostGuard before being rebranded to enterN | Ghost Tamer
