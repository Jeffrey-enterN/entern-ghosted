// Add CSS styles for the overlay
const styleEl = document.createElement('style');
styleEl.textContent = `
  .ghosted-overlay {
    position: fixed;
    bottom: 1rem;
    right: 1rem;
    width: 16rem;
    z-index: 9999;
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  }
  
  .ghosted-card {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    border: 1px solid #e5e7eb;
    overflow: hidden;
  }
  
  .ghosted-card-content {
    padding: 1rem;
  }
  
  .ghosted-flex {
    display: flex;
  }
  
  .ghosted-flex-between {
    justify-content: space-between;
    align-items: center;
  }
  
  .ghosted-heading {
    font-size: 0.875rem;
    font-weight: 600;
    color: #111827;
  }
  
  .ghosted-badge {
    display: inline-flex;
    align-items: center;
    padding: 0.125rem 0.625rem;
    border-radius: 9999px;
    font-size: 0.75rem;
    font-weight: 500;
  }
  
  .ghosted-badge-green {
    background-color: #BBF7D0;
    color: #166534;
  }
  
  .ghosted-badge-yellow {
    background-color: #FEF3C7;
    color: #92400E;
  }
  
  .ghosted-badge-red {
    background-color: #FEE2E2;
    color: #B91C1C;
  }
  
  .ghosted-text-sm {
    font-size: 0.75rem;
  }
  
  .ghosted-text-gray {
    color: #6B7280;
  }
  
  .ghosted-mt-1 {
    margin-top: 0.25rem;
  }
  
  .ghosted-mt-3 {
    margin-top: 0.75rem;
  }
  
  .ghosted-button {
    width: 100%;
    display: inline-flex;
    justify-content: center;
    align-items: center;
    padding: 0.5rem 0.75rem;
    border: 1px solid transparent;
    font-size: 0.75rem;
    font-weight: 500;
    border-radius: 0.375rem;
    color: white;
    background-color: #6366F1;
    cursor: pointer;
  }
  
  .ghosted-button:hover {
    background-color: #4F46E5;
  }
`;
document.head.appendChild(styleEl);

// Job board detection configuration
const jobBoardConfigs = {
  linkedin: {
    hostMatch: /(www\.linkedin\.com)/i,
    pathMatch: /\/jobs\/view\//i,
    selectors: {
      title: '.job-details-jobs-unified-top-card__job-title',
      company: '.job-details-jobs-unified-top-card__company-name',
      location: '.job-details-jobs-unified-top-card__bullet',
    }
  },
  indeed: {
    hostMatch: /(www\.indeed\.com)/i,
    pathMatch: /\/viewjob/i,
    selectors: {
      title: '.jobsearch-JobInfoHeader-title',
      company: '.jobsearch-CompanyReview-text',
      location: '.jobsearch-JobInfoHeader-subtitle .jobsearch-JobInfoHeader-subtitle-workplace',
    }
  },
  ziprecruiter: {
    hostMatch: /(www\.ziprecruiter\.com)/i,
    pathMatch: /\/jobs\//i,
    selectors: {
      title: '.job_title',
      company: '.hiring_company_name',
      location: '.hiring_location',
    }
  },
  monster: {
    hostMatch: /(www\.monster\.com)/i,
    pathMatch: /\/job-details\//i,
    selectors: {
      title: '.job-title',
      company: '.name',
      location: '.location',
    }
  }
};

// Detect job listings on the page
function detectJobListing() {
  const url = window.location.href;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Determine which job board we're on
  let jobBoard = null;
  let selectors = null;
  
  for (const [board, config] of Object.entries(jobBoardConfigs)) {
    if (config.hostMatch.test(hostname) && config.pathMatch.test(pathname)) {
      jobBoard = board;
      selectors = config.selectors;
      break;
    }
  }
  
  if (!jobBoard || !selectors) {
    return null;
  }
  
  // Extract job details using selectors
  try {
    const title = document.querySelector(selectors.title)?.textContent?.trim() || '';
    const company = document.querySelector(selectors.company)?.textContent?.trim() || '';
    const location = document.querySelector(selectors.location)?.textContent?.trim() || '';
    
    if (!title || !company) {
      return null;
    }
    
    return {
      title,
      company,
      location,
      jobBoard,
      url,
    };
  } catch (error) {
    console.error('Error detecting job listing:', error);
    return null;
  }
}

// Fetch company ghosting data from API
async function fetchCompanyData(companyName) {
  try {
    // This would be a real API endpoint in production
    const apiUrl = `https://ghosted-extension.com/api/companies/stats?name=${encodeURIComponent(companyName)}`;
    
    // For demo purposes, return mock data
    return {
      id: 1,
      name: companyName,
      ghostingRate: Math.floor(Math.random() * 100),
      totalReports: Math.floor(Math.random() * 100),
      stageBreakdown: {
        "Initial Application": Math.floor(Math.random() * 100),
        "After Phone Screen": Math.floor(Math.random() * 100),
        "After First Interview": Math.floor(Math.random() * 100),
        "After Multiple Interviews": Math.floor(Math.random() * 100),
        "After Final Round": Math.floor(Math.random() * 100),
        "After Verbal Offer": Math.floor(Math.random() * 100)
      }
    };
  } catch (error) {
    console.error("Error fetching company data:", error);
    return null;
  }
}

// Create and inject the ghosting overlay
function injectGhostingOverlay(jobDetails, companyData) {
  // Remove existing overlay if present
  const existingOverlay = document.querySelector('.ghosted-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Determine rating class based on ghosting rate
  let ratingClass = 'ghosted-badge-green';
  if (companyData.ghostingRate >= 50) {
    ratingClass = 'ghosted-badge-red';
  } else if (companyData.ghostingRate >= 20) {
    ratingClass = 'ghosted-badge-yellow';
  }
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'ghosted-overlay';
  
  // Get top two most common ghosting stages
  const topStages = Object.entries(companyData.stageBreakdown)
    .filter(([_, value]) => value > 0)
    .sort(([_, a], [_, b]) => b - a)
    .slice(0, 2);
    
  // Generate stage breakdown HTML
  let stageBreakdownHtml = '';
  topStages.forEach(([stage, percentage], index) => {
    const color = percentage >= 50 ? 'text-red-700' : (percentage >= 20 ? 'text-amber-700' : 'text-green-700');
    stageBreakdownHtml += `
      <div class="ghosted-flex ghosted-flex-between ${index > 0 ? 'ghosted-mt-1' : ''}">
        <span>${stage}:</span>
        <span style="font-weight: 500; ${color === 'text-red-700' ? 'color: #B91C1C' : (color === 'text-amber-700' ? 'color: #92400E' : 'color: #166534')}">${percentage}%</span>
      </div>
    `;
  });
  
  overlay.innerHTML = `
    <div class="ghosted-card">
      <div class="ghosted-card-content">
        <div class="ghosted-flex ghosted-flex-between">
          <h3 class="ghosted-heading">Ghosted Rating</h3>
          <span class="ghosted-badge ${ratingClass}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" style="width: 1rem; height: 1rem; margin-right: 0.25rem;" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            ${companyData.ghostingRate}% ghosting
          </span>
        </div>
        <p class="ghosted-text-sm ghosted-text-gray ghosted-mt-1">Based on ${companyData.totalReports} reports from job seekers</p>
        
        <div class="ghosted-text-sm ghosted-mt-3">
          ${stageBreakdownHtml}
        </div>
        
        <div class="ghosted-mt-3">
          <button class="ghosted-button" id="ghosted-view-details">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Append to document
  document.body.appendChild(overlay);
  
  // Add event listener for the View Details button
  document.getElementById('ghosted-view-details').addEventListener('click', () => {
    chrome.runtime.sendMessage({ action: 'openPopup' });
  });
}

// Initialize after content loads
let currentJobDetails = null;

// Run job detection
async function detectAndInjectOverlay() {
  // Get settings first
  chrome.storage.local.get(['settings'], async (result) => {
    const settings = result.settings || { showOverlays: true, autoDetectJobs: true };
    
    // Only proceed if settings allow
    if (!settings.autoDetectJobs || !settings.showOverlays) {
      return;
    }
    
    // Detect job
    const jobDetails = detectJobListing();
    if (!jobDetails) {
      return;
    }
    
    // Store for popup
    currentJobDetails = jobDetails;
    
    // Fetch company data
    const companyData = await fetchCompanyData(jobDetails.company);
    if (companyData) {
      injectGhostingOverlay(jobDetails, companyData);
    }
  });
}

// Run detection on page load with a delay to ensure DOM is fully loaded
setTimeout(detectAndInjectOverlay, 1500);

// Listen for messages from popup or background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "getJobDetails") {
    // Detect job if we haven't already
    if (!currentJobDetails) {
      currentJobDetails = detectJobListing();
    }
    
    // Send back job details
    sendResponse({ jobDetails: currentJobDetails });
  }
  
  // Return true to indicate we will respond asynchronously
  return true;
});

// Re-run detection when URL changes (for single page applications)
let lastUrl = location.href;
new MutationObserver(() => {
  if (location.href !== lastUrl) {
    lastUrl = location.href;
    setTimeout(detectAndInjectOverlay, 1500);
  }
}).observe(document, { subtree: true, childList: true });
