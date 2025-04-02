import { v4 as uuidv4 } from 'uuid';
import { JobDetails, jobDetailsSchema } from '@shared/schema';

// Extension information
interface ExtensionInfo {
  reporterId: string;
  version: string;
}

// Local storage keys
const REPORTER_ID_KEY = 'ghosted_reporter_id';
const SETTINGS_KEY = 'ghosted_settings';

/**
 * Get extension information including reporter ID
 */
export async function getExtensionInfo(): Promise<ExtensionInfo> {
  // Check for existing reporter ID in local storage
  let reporterId = localStorage.getItem(REPORTER_ID_KEY);
  
  // If no ID exists, create one and store it
  if (!reporterId) {
    reporterId = uuidv4();
    localStorage.setItem(REPORTER_ID_KEY, reporterId);
  }
  
  return {
    reporterId,
    version: '1.0.0',
  };
}

/**
 * Get job details from the current page
 * In a real extension, this would communicate with the content script
 */
export async function getJobDetails(): Promise<JobDetails | null> {
  // In a real extension, we would get this data from the content script
  // For development, we'll return mock data if we're in the extension context
  
  // Check if we're in a browser extension context
  const isExtension = !!(window.chrome && chrome.runtime && chrome.runtime.id);
  
  if (isExtension) {
    // In a real extension, we would send a message to the content script
    return new Promise((resolve) => {
      chrome.tabs.query({active: true, currentWindow: true}, (tabs) => {
        chrome.tabs.sendMessage(tabs[0].id!, {action: "getJobDetails"}, (response) => {
          if (response && response.jobDetails) {
            resolve(response.jobDetails);
          } else {
            resolve(null);
          }
        });
      });
    });
  } else {
    // For development, we'll check URL for job board parameters
    const urlParams = new URLSearchParams(window.location.search);
    const testJobBoard = urlParams.get('jobBoard');
    
    if (testJobBoard) {
      try {
        return jobDetailsSchema.parse({
          title: "Senior Software Engineer",
          company: "Acme Corporation",
          location: "New York, NY",
          jobBoard: testJobBoard as any || "linkedin",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Invalid job details:", error);
        return null;
      }
    }
    
    return null;
  }
}

/**
 * Open extension options page
 */
export function openOptionsPage(): void {
  if (window.chrome && chrome.runtime && chrome.runtime.id) {
    chrome.runtime.openOptionsPage();
  }
}
