import { useEffect } from "react";
import { useGhostGuard } from "@/context/GhostGuardContext";
import JobCard from "@/components/JobCard";
import EmployerCard from "@/components/EmployerCard";

const Home = () => {
  const { currentJob, recentJobs, topEmployers, refreshData } = useGhostGuard();
  
  useEffect(() => {
    refreshData();
  }, []);
  
  return (
    <div className="p-4">
      {/* Current Job Listing Alert */}
      {currentJob && (
        <JobCard job={currentJob} isCurrentJob={true} showActions={true} />
      )}
      
      {/* Recently Viewed */}
      <h3 className="font-medium text-sm text-slate-700 mb-3">Recently Viewed</h3>
      
      {recentJobs.length > 0 ? (
        recentJobs.map(job => (
          <JobCard key={job.id} job={job} />
        ))
      ) : (
        <div className="text-center py-4 text-slate-500 text-sm">
          No recently viewed jobs
        </div>
      )}
      
      {/* Top Employers Section */}
      <h3 className="font-medium text-sm text-slate-700 mt-5 mb-3">Top Rated Employers</h3>
      
      {topEmployers.length > 0 ? (
        topEmployers.map(employer => (
          <EmployerCard key={employer.id} employer={employer} />
        ))
      ) : (
        <div className="text-center py-4 text-slate-500 text-sm">
          No employer data available yet
        </div>
      )}
      
      <div className="text-center mt-3">
        <button className="text-xs text-primary font-medium hover:underline">
          See All Employers
        </button>
      </div>
    </div>
  );
};

export default Home;
