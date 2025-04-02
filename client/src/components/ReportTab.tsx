import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation } from "@tanstack/react-query";
import { Info } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Import from shared schema and extend
import { insertGhostingReportSchema } from "@shared/schema";

interface ReportTabProps {
  jobBoard: string | null;
}

// Extend the schema with client-side validation
const reportSchema = insertGhostingReportSchema.extend({
  applicationDate: z.string().min(1, "Application date is required"),
  ghostingStage: z.string().min(1, "Please select the ghosting stage"),
  timeElapsed: z.string().min(1, "Please select how long you waited"),
});

type ReportFormValues = z.infer<typeof reportSchema>;

export default function ReportTab({ jobBoard }: ReportTabProps) {
  const { toast } = useToast();
  
  const form = useForm<ReportFormValues>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      companyName: "",
      jobTitle: "",
      applicationDate: "",
      ghostingStage: "",
      timeElapsed: "",
      details: "",
      anonymous: false,
      jobBoard: jobBoard || undefined,
    },
  });
  
  const submitReport = useMutation({
    mutationFn: async (data: ReportFormValues) => {
      const response = await apiRequest("POST", "/api/reports", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
      queryClient.invalidateQueries({ queryKey: ["/api/stats/top-ghosting"] });
      queryClient.invalidateQueries({ queryKey: ["/api/reports/recent"] });
      
      toast({
        title: "Report Submitted",
        description: "Thank you for contributing to make job searching better for everyone.",
      });
      
      form.reset({
        companyName: "",
        jobTitle: "",
        applicationDate: "",
        ghostingStage: "",
        timeElapsed: "",
        details: "",
        anonymous: false,
        jobBoard: jobBoard || undefined,
      });
    },
    onError: (error) => {
      toast({
        title: "Submission Failed",
        description: error.message || "There was an error submitting your report. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  const onSubmit = (data: ReportFormValues) => {
    submitReport.mutate(data);
  };
  
  return (
    <div className="tab-content p-4">
      <div className="bg-gray-50 rounded-lg p-4 mb-4">
        <div className="flex items-start mb-4">
          <div className="bg-primary bg-opacity-10 p-2 rounded-lg mr-3">
            <Info className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Report a Ghosting Experience</h3>
            <p className="text-xs text-gray-500 mt-1">Submit details about an employer who ghosted you during the application process.</p>
          </div>
        </div>
      </div>
      
      {/* Report Form */}
      <form onSubmit={form.handleSubmit(onSubmit)}>
        {/* Company Information */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Company Name</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              form.formState.errors.companyName ? "border-red-500" : ""
            }`}
            placeholder="Enter company name" 
            {...form.register("companyName")}
          />
          {form.formState.errors.companyName && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.companyName.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Job Title</label>
          <input 
            type="text" 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              form.formState.errors.jobTitle ? "border-red-500" : ""
            }`}
            placeholder="Enter job title" 
            {...form.register("jobTitle")}
          />
          {form.formState.errors.jobTitle && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.jobTitle.message}</p>
          )}
        </div>
        
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Application Date</label>
          <input 
            type="date" 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              form.formState.errors.applicationDate ? "border-red-500" : ""
            }`}
            {...form.register("applicationDate")}
          />
          {form.formState.errors.applicationDate && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.applicationDate.message}</p>
          )}
        </div>
        
        {/* Ghosting Stage */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Ghosting Stage</label>
          <select 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              form.formState.errors.ghostingStage ? "border-red-500" : ""
            }`}
            {...form.register("ghostingStage")}
          >
            <option value="" disabled>Select stage</option>
            <option value="application">After Application Submission</option>
            <option value="screening">After Initial Screening</option>
            <option value="firstInterview">After First Interview</option>
            <option value="technicalInterview">After Technical Interview</option>
            <option value="finalInterview">After Final Interview</option>
            <option value="offerDiscussion">During Offer Discussion</option>
          </select>
          {form.formState.errors.ghostingStage && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.ghostingStage.message}</p>
          )}
        </div>
        
        {/* Time Elapsed */}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">How long did you wait before considering it ghosting?</label>
          <select 
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm ${
              form.formState.errors.timeElapsed ? "border-red-500" : ""
            }`}
            {...form.register("timeElapsed")}
          >
            <option value="" disabled>Select time period</option>
            <option value="1-2weeks">1-2 weeks</option>
            <option value="3-4weeks">3-4 weeks</option>
            <option value="1-2months">1-2 months</option>
            <option value="3+months">3+ months</option>
          </select>
          {form.formState.errors.timeElapsed && (
            <p className="text-red-500 text-xs mt-1">{form.formState.errors.timeElapsed.message}</p>
          )}
        </div>
        
        {/* Additional Details */}
        <div className="mb-5">
          <label className="block text-sm font-medium mb-1">Additional Details (Optional)</label>
          <textarea 
            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-sm"
            rows={3}
            placeholder="Share any additional context about your experience" 
            {...form.register("details")}
          />
        </div>
        
        {/* Anonymous Report Option */}
        <div className="flex items-center mb-5">
          <div className="relative inline-block w-10 mr-2 align-middle select-none">
            <input 
              type="checkbox" 
              id="anonymous" 
              className="toggle-checkbox absolute block w-6 h-6 rounded-full bg-white border-4 appearance-none cursor-pointer right-0"
              {...form.register("anonymous")}
            />
            <label htmlFor="anonymous" className="toggle-label block overflow-hidden h-6 rounded-full bg-gray-300 cursor-pointer"></label>
          </div>
          <label htmlFor="anonymous" className="text-sm font-medium cursor-pointer">Submit Anonymously</label>
        </div>
        
        {/* Submit Button */}
        <button 
          type="submit" 
          className="w-full bg-primary text-white font-medium py-2 px-4 rounded-lg shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400 transition-colors duration-150"
          disabled={submitReport.isPending}
        >
          {submitReport.isPending ? "Submitting..." : "Submit Report"}
        </button>
      </form>
    </div>
  );
}
