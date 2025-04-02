// Extension API functions

// Base API URL - this would be updated for production
const API_BASE_URL = 'http://localhost:5000';

// Helper function to make API requests
async function apiRequest(
  method: string,
  endpoint: string,
  data?: any
): Promise<any> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API request failed: ${response.status} ${errorText}`);
    }

    return await response.json();
  } catch (error) {
    console.error(`API ${method} request to ${endpoint} failed:`, error);
    throw error;
  }
}

// Get extension info including reporter ID - stored in local storage
export async function getExtensionInfo(): Promise<{reporterId: string}> {
  // Generate a unique reporter ID if none exists yet
  let reporterId = localStorage.getItem('ghosted_reporter_id');
  if (!reporterId) {
    reporterId = `reporter_${Math.random().toString(36).substring(2, 12)}`;
    localStorage.setItem('ghosted_reporter_id', reporterId);
  }
  
  return { reporterId };
}

// Get job details from the current page (or mock for development)
export async function getJobDetails(): Promise<any> {
  // In the browser extension, this would communicate with the content script
  // For development, we'll just return mock data or try to detect from URL
  try {
    // Check if we have a stored job from content script
    const storedJob = localStorage.getItem('current_job_details');
    if (storedJob) {
      return JSON.parse(storedJob);
    }
    
    // For development fallback
    return {
      title: 'Software Engineer',
      company: 'TechCorp',
      location: 'San Francisco, CA',
      jobBoard: 'linkedin',
      url: window.location.href
    };
  } catch (error) {
    console.error('Error getting job details:', error);
    return null;
  }
}

// Get company stats by name
export async function getCompanyStats(companyName: string): Promise<any> {
  return apiRequest('GET', `/api/companies/stats?name=${encodeURIComponent(companyName)}`);
}

// Get stats for a job URL
export async function getJobUrlStats(jobUrl: string): Promise<any> {
  return apiRequest('GET', `/api/url/stats?url=${encodeURIComponent(jobUrl)}`);
}

// Submit a ghosting report
export async function submitGhostingReport(reportData: any): Promise<any> {
  return apiRequest('POST', '/api/reports', reportData);
}

// Get all reports for a reporter
export async function getReporterReports(reporterId: string): Promise<any> {
  return apiRequest('GET', `/api/reporters/${reporterId}/reports`);
}

// Get company reports
export async function getCompanyReports(companyId: number): Promise<any> {
  return apiRequest('GET', `/api/companies/${companyId}/reports`);
}

// Create a company
export async function createCompany(companyData: any): Promise<any> {
  return apiRequest('POST', '/api/companies', companyData);
}