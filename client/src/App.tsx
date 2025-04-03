import { useState, useEffect } from "react";
import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { useToast } from "@/hooks/use-toast";
import Home from "@/pages/Home";
import MyReports from "@/pages/MyReports";
import Settings from "@/pages/Settings";
import Help from "@/pages/Help";
import NavFooter from "@/components/NavFooter";
import NotFound from "@/pages/not-found";
import { getExtensionInfo, getJobDetails } from "./lib/extensionApi";
import { JobDetails as JobDetailsType } from "@shared/schema";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/my-reports" component={MyReports} />
      <Route path="/settings" component={Settings} />
      <Route path="/help" component={Help} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  const [jobDetails, setJobDetails] = useState<JobDetailsType | null>(null);
  const [reporterId, setReporterId] = useState<string | null>(null);
  const [location, setLocation] = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Initialize extension and get job details if available
    const initializeExtension = async () => {
      try {
        // Get extension info (including reporter ID)
        const extensionInfo = await getExtensionInfo();
        if (extensionInfo.reporterId) {
          setReporterId(extensionInfo.reporterId);
        }

        // Get job details if on a job board
        const details = await getJobDetails();
        if (details) {
          setJobDetails(details);
        }
      } catch (error) {
        console.error("Failed to initialize extension:", error);
        toast({
          title: "Extension Error",
          description: "Failed to initialize the extension properly.",
          variant: "destructive",
        });
      }
    };

    initializeExtension();
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex flex-col h-[500px] w-[380px] bg-gray-50 text-gray-800">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-4 py-3 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center">
            <svg className="h-8 w-8 text-primary" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <path d="M12 4c-4.4 0-8 3.6-8 8v6c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2v-6c0-4.4-3.6-8-8-8z" fill="#F8F3E9" stroke="#3D302A" strokeWidth="1.5"/>
              <path d="M9 9.5c.5-.8 2-.8 2.5 0M15 9.5c-.5-.8-2-.8-2.5 0" fill="#3D302A"/>
              <path d="M10 12.5a2 2 0 104 0" stroke="#3D302A" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M4 18c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5-.5-1.5-1.5-1.5S4 17 4 18zM7 18c0 1 .5 1.5 1.5 1.5s1.5-.5 1.5-1.5-.5-1.5-1.5-1.5S7 17 7 18z" fill="#F8F3E9" stroke="#3D302A" strokeWidth="1.5"/>
            </svg>
            <h1 className="ml-2 text-lg font-bold text-gray-800">Powered by <span className="text-indigo-600">enterN</span></h1>
          </div>
          <div className="flex items-center space-x-2">
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setLocation("/settings")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
              </svg>
            </button>
            <button 
              className="text-gray-500 hover:text-gray-700"
              onClick={() => setLocation("/help")}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-8-3a1 1 0 00-.867.5 1 1 0 11-1.731-1A3 3 0 0113 8a3.001 3.001 0 01-2 2.83V11a1 1 0 11-2 0v-1a1 1 0 011-1 1 1 0 100-2zm0 8a1 1 0 100-2 1 1 0 000 2z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-y-auto">
          <Router />
        </main>

        {/* Footer Navigation */}
        <NavFooter currentPath={location} />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
