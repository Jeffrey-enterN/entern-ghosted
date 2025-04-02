import { useState, useEffect } from "react";
import { useGhostGuard } from "@/context/GhostGuardContext";
import ReportCard from "@/components/ReportCard";
import { useQuery } from "@tanstack/react-query";

const Reports = () => {
  const { submitterId, setActiveTab } = useGhostGuard();
  const [timeFilter, setTimeFilter] = useState<string>("all");
  
  const { data: reports, isLoading } = useQuery({
    queryKey: [`/api/reports?submitterId=${submitterId}`],
    staleTime: 60000, // 1 minute
  });
  
  // Filter reports based on selected time range
  const getFilteredReports = () => {
    if (!reports || !reports.length) return [];
    
    if (timeFilter === "all") return reports;
    
    const now = new Date();
    const monthsAgo = (months: number) => {
      const date = new Date(now);
      date.setMonth(date.getMonth() - months);
      return date;
    };
    
    return reports.filter((report: any) => {
      const reportDate = new Date(report.date);
      if (timeFilter === "3months") {
        return reportDate >= monthsAgo(3);
      } else if (timeFilter === "6months") {
        return reportDate >= monthsAgo(6);
      }
      return true;
    });
  };
  
  const filteredReports = getFilteredReports();
  
  const handleSubmitFirstReport = () => {
    setActiveTab("newReport");
  };
  
  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-medium text-slate-800">My Ghosting Reports</h2>
        <div className="relative">
          <select 
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value)}
            className="text-xs bg-white border border-slate-300 rounded-md px-2 py-1 pr-7 appearance-none focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="all">All reports</option>
            <option value="3months">Last 3 months</option>
            <option value="6months">Last 6 months</option>
          </select>
          <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-1 text-slate-500">
            <i className="ri-arrow-down-s-line"></i>
          </div>
        </div>
      </div>
      
      {isLoading ? (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">
            <i className="ri-loader-4-line text-2xl animate-spin"></i>
          </div>
          <p className="text-xs text-slate-500">Loading your reports...</p>
        </div>
      ) : filteredReports.length === 0 ? (
        <div className="text-center py-8">
          <div className="text-slate-400 mb-2">
            <i className="ri-ghost-line text-4xl"></i>
          </div>
          <h3 className="font-medium text-slate-700 mb-1">No Reports Yet</h3>
          <p className="text-xs text-slate-500 mb-4">You haven't submitted any ghosting reports yet.</p>
          <button 
            onClick={handleSubmitFirstReport}
            className="text-xs bg-primary hover:bg-primary-hover text-white font-medium py-1.5 px-4 rounded-md"
          >
            Submit Your First Report
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredReports.map((report: any) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </div>
      )}
    </div>
  );
};

export default Reports;
