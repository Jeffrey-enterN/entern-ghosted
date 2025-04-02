import { useEffect, useRef } from "react";

type Tab = "jobs" | "report" | "insights";

interface TabNavigationProps {
  activeTab: Tab;
  onTabChange: (tab: Tab) => void;
}

export default function TabNavigation({ activeTab, onTabChange }: TabNavigationProps) {
  const indicatorRef = useRef<HTMLDivElement>(null);
  
  // Update the indicator position when the active tab changes
  useEffect(() => {
    const tabs = ["jobs", "report", "insights"];
    const activeIndex = tabs.indexOf(activeTab);
    if (indicatorRef.current) {
      indicatorRef.current.style.transform = `translateX(${activeIndex * 100}%)`;
    }
  }, [activeTab]);
  
  return (
    <div className="bg-white border-b">
      <div className="flex relative">
        <button 
          className={`tab-button flex-1 font-medium py-3 px-4 text-center relative ${activeTab === "jobs" ? "text-primary" : "text-gray-500"}`}
          onClick={() => onTabChange("jobs")}
        >
          <span>Jobs</span>
        </button>
        <button 
          className={`tab-button flex-1 font-medium py-3 px-4 text-center relative ${activeTab === "report" ? "text-primary" : "text-gray-500"}`}
          onClick={() => onTabChange("report")}
        >
          <span>Report</span>
        </button>
        <button 
          className={`tab-button flex-1 font-medium py-3 px-4 text-center relative ${activeTab === "insights" ? "text-primary" : "text-gray-500"}`}
          onClick={() => onTabChange("insights")}
        >
          <span>Insights</span>
        </button>
        {/* Active tab indicator */}
        <div 
          ref={indicatorRef}
          className="tab-indicator absolute bottom-0 left-0 h-0.5 bg-primary transition-all duration-300" 
          style={{ width: "33.33%" }}
        />
      </div>
    </div>
  );
}
