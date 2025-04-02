// Background script for the GhostGuard extension

import { apiRequest } from './lib/queryClient';

// Store recently detected jobs
const recentJobs = new Map<string, any>();

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'JOB_DETECTED') {
    handleJobDetected(message.data, sender, sendResponse);
    return true; // Keep the messaging channel open for async response
  }
  return false;
});

// Handle job detection message
async function handleJobDetected(jobInfo: any, sender: chrome.runtime.MessageSender, sendResponse: (response: any) => void) {
  try {
    // Check if we already have data for this job
    const cacheKey = `${jobInfo.platform}:${jobInfo.platformJobId || jobInfo.url}`;
    
    if (recentJobs.has(cacheKey)) {
      sendResponse({ jobData: recentJobs.get(cacheKey) });
      return;
    }
    
    // Create/get employer
    const employerRes = await apiRequest("POST", "/api/employers", {
      name: jobInfo.company,
      website: `https://example.com/${jobInfo.company.toLowerCase().replace(/\s+/g, '')}`,
      domain: `${jobInfo.company.toLowerCase().replace(/\s+/g, '')}.example.com`
    });
    
    const employer = await employerRes.json();
    
    // Create/get job listing
    const jobRes = await apiRequest("POST", "/api/job-listings", {
      title: jobInfo.title,
      employerId: employer.id,
      platform: jobInfo.platform,
      jobUrl: jobInfo.url,
      platformJobId: jobInfo.platformJobId
    });
    
    const job = await jobRes.json();
    
    // Get job stats
    const jobWithStatsRes = await fetch(`/api/job-listings/${job.id}`);
    const jobWithStats = await jobWithStatsRes.json();
    
    // Store in recent jobs cache
    recentJobs.set(cacheKey, jobWithStats);
    
    // If we have too many cached jobs, remove the oldest ones
    if (recentJobs.size > 50) {
      const oldestKey = recentJobs.keys().next().value;
      recentJobs.delete(oldestKey);
    }
    
    // Send response back to content script
    sendResponse({ jobData: jobWithStats });
    
    // Update badge with rating info
    updateExtensionBadge(jobWithStats);
    
  } catch (error) {
    console.error('Error processing job data:', error);
    sendResponse({ error: 'Failed to process job data' });
  }
}

// Update the extension badge with rating information
function updateExtensionBadge(jobData: any) {
  if (!jobData || !jobData.ghostingScore) return;
  
  // Set badge text based on the ghosting score
  const score = Math.round(jobData.ghostingScore * 5);
  chrome.action.setBadgeText({ text: score.toString() });
  
  // Set badge color based on the score
  let color = '#EF4444'; // red for poor scores
  if (jobData.ghostingScore >= 0.8) {
    color = '#22C55E'; // green for good scores
  } else if (jobData.ghostingScore >= 0.4) {
    color = '#F59E0B'; // amber for moderate scores
  }
  
  chrome.action.setBadgeBackgroundColor({ color });
}

// Initialize extension
function initialize() {
  // Set default badge
  chrome.action.setBadgeText({ text: '' });
  
  // Check if we're on a supported job board when tab is updated
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const url = tab.url;
      const isSupportedJobBoard = 
        url.includes('linkedin.com/jobs') || 
        url.includes('indeed.com') || 
        url.includes('ziprecruiter.com') || 
        url.includes('monster.com');
      
      if (isSupportedJobBoard) {
        // Enable the extension on this tab
        chrome.action.enable(tabId);
      } else {
        // Disable the extension on this tab
        chrome.action.disable(tabId);
        chrome.action.setBadgeText({ text: '', tabId });
      }
    }
  });
}

// Run initialization
initialize();
