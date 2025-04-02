import { useState, useEffect } from "react";
import Header from "@/components/Header";
import SiteDetectionBanner from "@/components/SiteDetectionBanner";
import TabNavigation from "@/components/TabNavigation";
import JobsTab from "@/components/JobsTab";
import ReportTab from "@/components/ReportTab";
import InsightsTab from "@/components/InsightsTab";
import JobBoardOverlay from "@/components/JobBoardOverlay";
import { detectJobBoard } from "@/lib/job-boards";
import { useQuery } from "@tanstack/react-query";

type Tab = "jobs" | "report" | "insights";

export default function Home() {
  const [activeTab, setActiveTab] = useState<Tab>("jobs");
  const [detectedJobBoard, setDetectedJobBoard] = useState<string | null>(null);
  
  // Fetch job boards from the server
  const { data: jobBoards } = useQuery({
    queryKey: ["/api/job-boards"],
  });

  // Detect the current job board when component mounts
  useEffect(() => {
    if (jobBoards) {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const currentUrl = tabs[0]?.url || "";
        const detectedBoard = detectJobBoard(currentUrl, jobBoards);
        setDetectedJobBoard(detectedBoard);
      });
    }
  }, [jobBoards]);

  return (
    <div className="flex flex-col h-screen bg-white">
      <Header />
      
      {detectedJobBoard && (
        <SiteDetectionBanner jobBoard={detectedJobBoard} />
      )}
      
      <TabNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-grow overflow-auto">
        {activeTab === "jobs" && <JobsTab jobBoard={detectedJobBoard} />}
        {activeTab === "report" && <ReportTab jobBoard={detectedJobBoard} />}
        {activeTab === "insights" && <InsightsTab />}
      </div>
      
      <JobBoardOverlay />
    </div>
  );
}
