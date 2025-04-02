import { useState } from "react";
import { useGhostGuard } from "@/context/GhostGuardContext";
import { useGhostingReports } from "@/hooks/useGhostingReports";
import { GhostingStage } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

const ReportForm = () => {
  const { currentJob, setActiveTab } = useGhostGuard();
  const { submitReport, isSubmitting, submitError } = useGhostingReports();
  const { toast } = useToast();
  
  const [ghostingStage, setGhostingStage] = useState<GhostingStage | "">("");
  const [ghostingDate, setGhostingDate] = useState<string>("");
  const [details, setDetails] = useState<string>("");
  const [shareContact, setShareContact] = useState<boolean>(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!ghostingStage) {
      toast({
        title: "Missing information",
        description: "Please select when you were ghosted",
        variant: "destructive"
      });
      return;
    }
    
    if (!ghostingDate) {
      toast({
        title: "Missing information",
        description: "Please enter the date when this happened",
        variant: "destructive"
      });
      return;
    }
    
    const success = await submitReport({
      stage: ghostingStage as GhostingStage,
      date: new Date(ghostingDate),
      details: details,
      shareContact
    });
    
    if (success) {
      toast({
        title: "Report submitted",
        description: "Thank you for your report. It will help other job seekers make informed decisions.",
      });
      setActiveTab("home");
    } else if (submitError) {
      toast({
        title: "Error",
        description: submitError,
        variant: "destructive"
      });
    }
  };
  
  const handleChangeJob = () => {
    // In a real extension, this would open a job selection interface
    toast({
      description: "This feature would allow selecting a different job in the full extension",
    });
  };
  
  return (
    <div>
      <h2 className="font-medium text-slate-800 mb-4">Report A Ghosting Experience</h2>
      
      {/* Current job context */}
      <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 mb-4">
        {currentJob ? (
          <div>
            <h3 className="font-medium text-sm">{currentJob.title}</h3>
            <p className="text-slate-500 text-xs">{currentJob.employer.name}</p>
          </div>
        ) : (
          <div>
            <h3 className="font-medium text-sm text-slate-500">No job selected</h3>
            <p className="text-slate-500 text-xs">Please select a job listing first</p>
          </div>
        )}
        <div className="mt-2">
          <button 
            onClick={handleChangeJob}
            className="text-xs text-primary hover:text-primary-hover font-medium"
          >
            Change job listing
          </button>
        </div>
      </div>
      
      {/* Report Form */}
      <form onSubmit={handleSubmit}>
        {/* Report Type */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1">When were you ghosted?</label>
          <div className="space-y-2">
            <label className="flex items-center">
              <input 
                type="radio" 
                name="ghostingStage" 
                value={GhostingStage.APPLICATION}
                checked={ghostingStage === GhostingStage.APPLICATION}
                onChange={() => setGhostingStage(GhostingStage.APPLICATION)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="ml-2 text-sm text-slate-600">After submitting application</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="ghostingStage" 
                value={GhostingStage.SCREENING}
                checked={ghostingStage === GhostingStage.SCREENING}
                onChange={() => setGhostingStage(GhostingStage.SCREENING)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="ml-2 text-sm text-slate-600">After initial screening</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="ghostingStage" 
                value={GhostingStage.INTERVIEW}
                checked={ghostingStage === GhostingStage.INTERVIEW}
                onChange={() => setGhostingStage(GhostingStage.INTERVIEW)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="ml-2 text-sm text-slate-600">After interview process</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="ghostingStage" 
                value={GhostingStage.ASSESSMENT}
                checked={ghostingStage === GhostingStage.ASSESSMENT}
                onChange={() => setGhostingStage(GhostingStage.ASSESSMENT)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="ml-2 text-sm text-slate-600">After technical assessment</span>
            </label>
            <label className="flex items-center">
              <input 
                type="radio" 
                name="ghostingStage" 
                value={GhostingStage.OFFER}
                checked={ghostingStage === GhostingStage.OFFER}
                onChange={() => setGhostingStage(GhostingStage.OFFER)}
                className="text-primary focus:ring-primary h-3.5 w-3.5"
              />
              <span className="ml-2 text-sm text-slate-600">After discussing offer</span>
            </label>
          </div>
        </div>
        
        {/* Date Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="ghostingDate">
            When did this happen?
          </label>
          <input 
            type="date" 
            id="ghostingDate"
            value={ghostingDate}
            onChange={(e) => setGhostingDate(e.target.value)}
            className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
            required
          />
        </div>
        
        {/* Details Input */}
        <div className="mb-4">
          <label className="block text-xs font-medium text-slate-700 mb-1" htmlFor="ghostingDetails">
            Additional details (optional)
          </label>
          <textarea 
            id="ghostingDetails" 
            placeholder="Describe your experience..." 
            rows={3}
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="block w-full text-sm rounded-md border-slate-300 shadow-sm focus:border-primary focus:ring focus:ring-primary focus:ring-opacity-50"
          ></textarea>
        </div>
        
        {/* Contact Info Toggle */}
        <div className="mb-4">
          <label className="flex items-center">
            <input 
              type="checkbox" 
              id="shareContactInfo"
              checked={shareContact}
              onChange={(e) => setShareContact(e.target.checked)}
              className="text-primary focus:ring-primary h-3.5 w-3.5"
            />
            <span className="ml-2 text-sm text-slate-600">
              Share my contact info with this employer if they want to respond
            </span>
          </label>
        </div>
        
        {/* Submit Button */}
        <div className="flex justify-end">
          <button 
            type="submit" 
            disabled={isSubmitting || !currentJob}
            className={`${
              isSubmitting || !currentJob 
                ? 'bg-slate-300 cursor-not-allowed' 
                : 'bg-primary hover:bg-primary-hover'
            } text-white text-sm font-medium px-4 py-2 rounded-md`}
          >
            {isSubmitting ? "Submitting..." : "Submit Report"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ReportForm;
