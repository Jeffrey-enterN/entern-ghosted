// Background script for Ghost Tamer extension

// API Base URL - change for production
const API_BASE_URL = 'http://localhost:5000';

// Helper function to make API requests
async function apiRequest(method, endpoint, data) {
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

// Unique ID for extension users
function generateReporterId() {
  const array = new Uint8Array(16);
  window.crypto.getRandomValues(array);
  const uuid = Array.from(array)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return uuid;
}

// Initialize extension data when installed
chrome.runtime.onInstalled.addListener(async () => {
  // Set initial settings
  const initialSettings = {
    autoDetectJobs: true,
    showOverlays: true,
    anonymousReporting: true,
    notificationsEnabled: false,
  };
  
  // Generate reporter ID if not exists
  const storage = await chrome.storage.local.get(["reporterId", "settings"]);
  
  if (!storage.reporterId) {
    await chrome.storage.local.set({ reporterId: generateReporterId() });
  }
  
  if (!storage.settings) {
    await chrome.storage.local.set({ settings: initialSettings });
  }
  
  console.log("Ghost Tamer extension initialized");
});

// Recent job cache
const recentJobsCache = new Map();

// Handle job detected messages
async function handleJobDetection(jobInfo, sender, sendResponse) {
  try {
    // Check if we already have data for this job in cache
    const cacheKey = `${jobInfo.jobBoard}:${jobInfo.url}`;
    
    if (recentJobsCache.has(cacheKey)) {
      sendResponse({ companyData: recentJobsCache.get(cacheKey) });
      return;
    }
    
    // Get company stats from API
    const companyStats = await apiRequest(
      'GET', 
      `/api/companies/stats?name=${encodeURIComponent(jobInfo.company)}`
    );
    
    // Cache the result
    recentJobsCache.set(cacheKey, companyStats);
    
    // Limit cache size
    if (recentJobsCache.size > 20) {
      const firstKey = Array.from(recentJobsCache.keys())[0];
      recentJobsCache.delete(firstKey);
    }
    
    // Update badge with ghosting rate
    updateBadge(companyStats.ghostingRate);
    
    // Send response back to content script
    sendResponse({ companyData: companyStats });
  } catch (error) {
    console.error("Error handling job detection:", error);
    
    // If company not found (404), create a default stats object
    if (error.message && error.message.includes('404')) {
      const defaultStats = {
        id: 0,
        name: jobInfo.company,
        ghostingRate: 0,
        totalReports: 0,
        stageBreakdown: {
          "Initial Application": 0,
          "After Phone Screen": 0,
          "After First Interview": 0,
          "After Multiple Interviews": 0,
          "After Final Round": 0,
          "After Verbal Offer": 0
        },
        recentReports: []
      };
      sendResponse({ companyData: defaultStats });
    } else {
      sendResponse({ error: "Failed to get company data" });
    }
  }
}

// Update extension badge based on ghosting rate
function updateBadge(ghostingRate) {
  if (typeof ghostingRate !== 'number') return;
  
  // Format badge text
  const badgeText = Math.round(ghostingRate).toString();
  chrome.action.setBadgeText({ text: badgeText });
  
  // Set badge color based on ghosting rate
  let color = '#22C55E'; // green (good)
  if (ghostingRate >= 50) {
    color = '#EF4444'; // red (bad)
  } else if (ghostingRate >= 20) {
    color = '#F59E0B'; // amber (caution)
  }
  
  chrome.action.setBadgeBackgroundColor({ color });
}

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Handle job detection message
  if (message.action === "jobDetected") {
    handleJobDetection(message.jobInfo, sender, sendResponse);
    return true; // Keep channel open for async response
  }
  
  // Open popup
  if (message.action === "openPopup") {
    chrome.action.openPopup();
    return true;
  }
  
  // Submit report
  if (message.action === "submitReport") {
    handleReportSubmission(message.reportData, sendResponse);
    return true;
  }
  
  // Get current reporter ID
  if (message.action === "getReporterId") {
    chrome.storage.local.get(['reporterId'], (result) => {
      sendResponse({ reporterId: result.reporterId });
    });
    return true;
  }
  
  // Get extension settings
  if (message.action === "getSettings") {
    chrome.storage.local.get(['settings'], (result) => {
      sendResponse({ settings: result.settings });
    });
    return true;
  }
  
  // Save settings
  if (message.action === "saveSettings") {
    chrome.storage.local.set({ settings: message.settings }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});

// Handle report submission
async function handleReportSubmission(reportData, sendResponse) {
  try {
    // Get reporter ID
    const { reporterId } = await chrome.storage.local.get(['reporterId']);
    
    // Add reporter ID to report data
    const fullReportData = {
      ...reportData,
      reporterId
    };
    
    // Submit report to API
    const result = await apiRequest('POST', '/api/reports', fullReportData);
    
    // Send response back
    sendResponse({ success: true, report: result });
    
    // Clear cache for this company to refresh data
    const companyName = reportData.companyName;
    for (let [key, value] of recentJobsCache.entries()) {
      if (value.name === companyName) {
        recentJobsCache.delete(key);
      }
    }
  } catch (error) {
    console.error("Error submitting report:", error);
    sendResponse({ error: "Failed to submit report" });
  }
}

// Initialize on startup
function initialize() {
  // Clear badge text
  chrome.action.setBadgeText({ text: '' });
  
  // Listen for tab updates
  chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (changeInfo.status === 'complete' && tab.url) {
      const url = tab.url;
      
      // Check if we're on a supported job board
      const isSupportedJobBoard = 
        url.includes('linkedin.com/jobs') || 
        url.includes('indeed.com/viewjob') || 
        url.includes('ziprecruiter.com/jobs') || 
        url.includes('monster.com/job-details');
      
      if (isSupportedJobBoard) {
        // Enable extension
        chrome.action.enable(tabId);
      } else {
        // Disable extension and clear badge
        chrome.action.disable(tabId);
        chrome.action.setBadgeText({ text: '', tabId });
      }
    }
  });
}

// Run initialization
initialize();