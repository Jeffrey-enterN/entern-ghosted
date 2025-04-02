import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { queryClient } from "@/lib/queryClient";
import { APPLICATION_STAGES, JobDetails, insertGhostingReportSchema } from "@shared/schema";
import { getExtensionInfo } from "@/lib/extensionApi";

interface GhostingFormProps {
  jobDetails: JobDetails;
  onCancel: () => void;
  onSuccess: () => void;
}

export default function GhostingForm({ jobDetails, onCancel, onSuccess }: GhostingFormProps) {
  const { toast } = useToast();
  const [reporterId, setReporterId] = useState<string>("");
  
  // Get reporter ID if not already set
  if (!reporterId) {
    getExtensionInfo().then(info => {
      if (info.reporterId) {
        setReporterId(info.reporterId);
      }
    });
  }
  
  // Create form validation schema based on ghosting report schema
  const formSchema = insertGhostingReportSchema
    .omit({ 
      companyId: true,
      reporterId: true 
    })
    .extend({
      companyName: z.string().min(1, "Company name is required"),
      companyWebsite: z.string().url().optional(),
    });
  
  // Set up form with default values
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      jobTitle: jobDetails.title,
      jobBoard: jobDetails.jobBoard,
      jobUrl: jobDetails.url,
      companyName: jobDetails.company,
      applicationStage: "Initial Application",
      incidentDate: new Date().toISOString().split('T')[0],
      details: "",
      anonymous: true,
    },
  });
  
  // Mutation for submitting the report
  const mutation = useMutation({
    mutationFn: (values: z.infer<typeof formSchema>) => {
      // Prepare the data for the API
      const requestData = {
        ...values,
        reporterId: reporterId || "anonymous",
      };
      return apiRequest("POST", "/api/reports", requestData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/companies/stats', jobDetails.company] });
      queryClient.invalidateQueries({ queryKey: ['/api/reporters', reporterId, 'reports'] });
      toast({
        title: "Report submitted",
        description: "Thank you for your contribution!",
      });
      onSuccess();
    },
    onError: (error) => {
      console.error("Error submitting report:", error);
      toast({
        title: "Submission failed",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    },
  });
  
  // Handle form submission
  const onSubmit = (values: z.infer<typeof formSchema>) => {
    if (!reporterId) {
      toast({
        title: "Error",
        description: "Unable to identify you. Please try again later.",
        variant: "destructive",
      });
      return;
    }
    
    mutation.mutate(values);
  };
  
  return (
    <div className="p-4 bg-white border-b border-gray-200">
      <h3 className="text-lg font-medium text-gray-900">Report Ghosting Experience</h3>
      <p className="text-sm text-gray-500 mt-1">Share your experience to help others</p>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-4 space-y-4">
          <FormField
            control={form.control}
            name="applicationStage"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Application Stage</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select stage" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {APPLICATION_STAGES.map((stage) => (
                      <SelectItem key={stage} value={stage}>{stage}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="incidentDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>When did this happen?</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="details"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Additional Details (Optional)</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Describe your experience..." 
                    {...field} 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="anonymous"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>Submit anonymously</FormLabel>
                </div>
              </FormItem>
            )}
          />
          
          <div className="flex justify-end space-x-3">
            <Button 
              type="button"
              variant="outline"
              onClick={onCancel}
              disabled={mutation.isPending}
            >
              Cancel
            </Button>
            <Button 
              type="submit"
              disabled={mutation.isPending}
            >
              {mutation.isPending ? "Submitting..." : "Submit Report"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
