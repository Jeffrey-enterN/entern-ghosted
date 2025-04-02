import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import GhostRating from "./GhostRating";
import { Skeleton } from "@/components/ui/skeleton";

interface JobsTabProps {
  jobBoard: string | null;
}

interface JobListing {
  id: number;
  title: string;
  company: string;
  location: string;
  description: string;
  postedDate: string;
  ghostingRate: number;
  remote?: boolean;
}

export default function JobsTab({ jobBoard }: JobsTabProps) {
  const [filterText, setFilterText] = useState("");
  
  // Fetch job listings with ghosting data
  const { data: jobListings, isLoading } = useQuery({
    queryKey: ["/api/reports"],
    select: (data) => {
      // Transform the data to meet our UI needs
      return data.map((report: any) => ({
        id: report.id,
        title: report.jobTitle,
        company: report.companyName,
        location: report.location || "Remote",
        description: report.details || "No description available",
        postedDate: new Date(report.applicationDate).toLocaleDateString(),
        ghostingRate: Math.floor(Math.random() * 100), // This would be derived from actual data
        remote: Math.random() > 0.5
      }));
    },
  });
  
  // Get top ghosting companies for stats
  const { data: topGhosting } = useQuery({
    queryKey: ["/api/stats/top-ghosting"],
  });
  
  // Filter job listings based on search text
  const filteredJobs = jobListings?.filter(job => 
    job.company.toLowerCase().includes(filterText.toLowerCase()) ||
    job.title.toLowerCase().includes(filterText.toLowerCase())
  ) || [];
  
  return (
    <div className="tab-content" id="jobs-tab">
      {/* Search Bar */}
      <div className="p-3 sticky top-0 bg-white z-10 border-b">
        <div className="relative">
          <input 
            type="text" 
            placeholder="Filter jobs by company..." 
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
          <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
      </div>
      
      {/* Job Listings */}
      <div className="divide-y">
        {isLoading ? (
          // Loading skeleton
          Array(3).fill(0).map((_, i) => (
            <div key={i} className="p-4">
              <Skeleton className="h-6 w-3/4 mb-2" />
              <Skeleton className="h-4 w-1/2 mb-2" />
              <Skeleton className="h-4 w-full mb-3" />
              <div className="flex justify-between">
                <Skeleton className="h-4 w-1/4" />
                <div className="flex space-x-2">
                  <Skeleton className="h-6 w-20" />
                  <Skeleton className="h-6 w-16" />
                </div>
              </div>
            </div>
          ))
        ) : filteredJobs.length > 0 ? (
          filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))
        ) : (
          <div className="p-8 text-center">
            <p className="text-gray-500">No job listings found</p>
          </div>
        )}
      </div>
    </div>
  );
}

interface JobCardProps {
  job: JobListing;
}

function JobCard({ job }: JobCardProps) {
  return (
    <div className="p-4 hover:bg-gray-50 transition-colors duration-150">
      <div className="flex justify-between items-start mb-2">
        <h3 className="font-semibold text-base">{job.title}</h3>
        <GhostRating rate={job.ghostingRate} />
      </div>
      <div className="mb-2">
        <div className="text-sm font-medium">{job.company}</div>
        <div className="text-xs text-gray-500">{job.location} {job.remote && "• Remote"}</div>
      </div>
      <p className="text-xs text-gray-500 mb-3 line-clamp-2">{job.description}</p>
      <div className="flex justify-between items-center">
        <span className="text-xs text-gray-500">Posted {job.postedDate}</span>
        <div>
          <button className="text-xs text-primary font-medium hover:text-purple-700 focus:outline-none mr-3">
            View Details
          </button>
          <button className="text-xs text-white bg-primary font-medium py-1 px-3 rounded-full hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400">
            Apply
          </button>
        </div>
      </div>
    </div>
  );
}
