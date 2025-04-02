// This script will be injected into job board pages

import { JobListingWithStats } from '@shared/schema';

// Data structure to hold detected job information
let detectedJob: {
  title: string;
  company: string;
  url: string;
  platform: string;
  platformJobId: string | null;
} | null = null;

// Supported job board platforms
const SUPPORTED_PLATFORMS = {
  LINKEDIN: {
    hostname: 'linkedin.com',
    id: 'linkedin',
    selectors: {
      title: '.job-details-jobs-unified-top-card__job-title',
      company: '.job-details-jobs-unified-top-card__company-name',
      jobId: (url: string) => {
        // Extract job ID from LinkedIn URL
        const match = url.match(/\/jobs\/view\/([0-9]+)/);
        return match ? match[1] : null;
      }
    }
  },
  INDEED: {
    hostname: 'indeed.com',
    id: 'indeed',
    selectors: {
      title: '.jobsearch-JobInfoHeader-title',
      company: '.jobsearch-InlineCompanyRating-companyName',
      jobId: (url: string) => {
        // Extract job ID from Indeed URL
        const match = url.match(/jk=([a-zA-Z0-9]+)/);
        return match ? match[1] : null;
      }
    }
  },
  ZIPRECRUITER: {
    hostname: 'ziprecruiter.com',
    id: 'ziprecruiter',
    selectors: {
      title: '.job_title',
      company: '.hiring_company_text',
      jobId: (url: string) => {
        // Extract job ID from ZipRecruiter URL
        const match = url.match(/\/([a-zA-Z0-9]+)$/);
        return match ? match[1] : null;
      }
    }
  },
  MONSTER: {
    hostname: 'monster.com',
    id: 'monster',
    selectors: {
      title: '.headline',
      company: '.name',
      jobId: (url: string) => {
        // Extract job ID from Monster URL
        const match = url.match(/\/job-openings\/([a-zA-Z0-9-]+)/);
        return match ? match[1] : null;
      }
    }
  }
};

// Detect the current job listing
function detectJobListing() {
  const currentUrl = window.location.href;
  const hostname = window.location.hostname;
  
  // Determine which platform we're on
  let platform = null;
  for (const [key, value] of Object.entries(SUPPORTED_PLATFORMS)) {
    if (hostname.includes(value.hostname)) {
      platform = value;
      break;
    }
  }
  
  if (!platform) {
    return null; // Not on a supported platform
  }
  
  // Check if this looks like a job page
  if (!(/jobs?|careers?|positions?/i.test(currentUrl))) {
    return null;
  }
  
  // Extract job information using platform-specific selectors
  try {
    const titleElement = document.querySelector(platform.selectors.title);
    const companyElement = document.querySelector(platform.selectors.company);
    
    if (!titleElement || !companyElement) {
      return null;
    }
    
    const title = titleElement.textContent?.trim() || 'Unknown Position';
    const company = companyElement.textContent?.trim() || 'Unknown Company';
    const platformJobId = platform.selectors.jobId(currentUrl);
    
    return {
      title,
      company,
      url: currentUrl,
      platform: platform.id,
      platformJobId
    };
  } catch (error) {
    console.error('Error detecting job listing:', error);
    return null;
  }
}

// Function to inject the rating badge into job listings
function injectRatingBadge(jobData: JobListingWithStats) {
  // This implementation will depend on the specific job board
  // Here's a simplified example:
  
  // For now, we'll just log that we would inject a badge here
  console.log('Would inject rating badge for:', jobData);
  
  // In a real implementation, this would inject HTML into the page
  // to show the ghosting rating next to the job title or company name
}

// Main content script logic
async function main() {
  // Detect job listing when page loads
  const jobInfo = detectJobListing();
  
  if (jobInfo) {
    // Send message to background script with job info
    chrome.runtime.sendMessage({
      type: 'JOB_DETECTED',
      data: jobInfo
    }, (response: { jobData?: JobListingWithStats }) => {
      if (response && response.jobData) {
        // If we got job data with ratings back, inject into the page
        injectRatingBadge(response.jobData);
      }
    });
  }
  
  // Listen for DOM changes to detect if user navigates to a new job
  const observer = new MutationObserver(() => {
    const newJobInfo = detectJobListing();
    
    // Only send a message if it's a different job than before
    if (newJobInfo && 
        (!detectedJob || 
         newJobInfo.url !== detectedJob.url || 
         newJobInfo.title !== detectedJob.title)) {
      
      detectedJob = newJobInfo;
      
      chrome.runtime.sendMessage({
        type: 'JOB_DETECTED',
        data: newJobInfo
      }, (response: { jobData?: JobListingWithStats }) => {
        if (response && response.jobData) {
          injectRatingBadge(response.jobData);
        }
      });
    }
  });
  
  // Observe changes to the DOM
  observer.observe(document.body, {
    childList: true,
    subtree: true
  });
}

// Run the main function
main();
