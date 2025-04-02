// Job detection utility for the extension

import { JobDetails } from '@shared/schema';

// Job board configuration
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
      company: '.hiring_company_text',
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

/**
 * Detect if current page is a job listing and extract details
 */
export function detectJobListing(): JobDetails | null {
  if (typeof window === 'undefined') {
    return null; // Not in browser environment
  }

  const url = window.location.href;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Determine which job board we're on
  let matchedBoard = null;
  let selectors = null;
  
  for (const [board, config] of Object.entries(jobBoardConfigs)) {
    if (config.hostMatch.test(hostname) && config.pathMatch.test(pathname)) {
      matchedBoard = board;
      selectors = config.selectors;
      break;
    }
  }
  
  if (!matchedBoard || !selectors) {
    return null; // Not on a supported job board
  }
  
  // Extract job details using selectors
  try {
    const titleElement = document.querySelector(selectors.title);
    const companyElement = document.querySelector(selectors.company);
    const locationElement = document.querySelector(selectors.location);
    
    if (!titleElement || !companyElement) {
      return null; // Required elements not found
    }
    
    const title = titleElement.textContent?.trim() || 'Unknown Position';
    const company = companyElement.textContent?.trim() || 'Unknown Company';
    const location = locationElement?.textContent?.trim() || '';
    
    return {
      title,
      company,
      location,
      jobBoard: matchedBoard as any,
      url
    };
  } catch (error) {
    console.error('Error detecting job listing:', error);
    return null;
  }
}

/**
 * Inject overlay with ghosting data into job listing
 */
export function injectGhostingOverlay(ghostingRate: number, totalReports: number, stageBreakdown: Record<string, number>): void {
  if (typeof document === 'undefined') {
    return; // Not in browser environment
  }

  // Remove existing overlay if present
  const existingOverlay = document.querySelector('.ghost-tamer-overlay');
  if (existingOverlay) {
    existingOverlay.remove();
  }
  
  // Determine rating class based on ghosting rate
  let ratingClass = 'ghost-tamer-badge-green';
  let ratingText = 'Low Risk';
  
  if (ghostingRate >= 50) {
    ratingClass = 'ghost-tamer-badge-red';
    ratingText = 'High Risk';
  } else if (ghostingRate >= 20) {
    ratingClass = 'ghost-tamer-badge-yellow';
    ratingText = 'Medium Risk';
  }
  
  // Get top two most common ghosting stages
  const topStages = Object.entries(stageBreakdown)
    .filter(([, value]) => value > 0)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 2);
  
  // Generate stage breakdown HTML
  let stageBreakdownHtml = '';
  if (topStages.length > 0) {
    topStages.forEach(([stage, percentage], index) => {
      const color = percentage >= 50 ? 'text-red-700' : (percentage >= 20 ? 'text-amber-700' : 'text-green-700');
      stageBreakdownHtml += `
        <div class="ghost-tamer-flex ghost-tamer-flex-between ${index > 0 ? 'ghost-tamer-mt-1' : ''}">
          <span>${stage}:</span>
          <span style="font-weight: 500; ${color === 'text-red-700' ? 'color: #B91C1C' : (color === 'text-amber-700' ? 'color: #92400E' : 'color: #166534')}">${percentage}%</span>
        </div>
      `;
    });
  } else {
    stageBreakdownHtml = '<div class="ghost-tamer-text-sm ghost-tamer-text-gray">No stage data available yet</div>';
  }
  
  // Create overlay HTML
  const overlayHTML = `
    <div class="ghost-tamer-card">
      <div class="ghost-tamer-header">
        <span class="ghost-tamer-title">enterN | Ghost Tamer</span>
        <span class="ghost-tamer-close" id="ghost-tamer-close">&times;</span>
      </div>
      <div class="ghost-tamer-content">
        <div class="ghost-tamer-flex ghost-tamer-flex-between">
          <h3 class="ghost-tamer-heading">Ghosting Rating</h3>
          <span class="ghost-tamer-badge ${ratingClass}">
            ${ghostingRate}% - ${ratingText}
          </span>
        </div>
        <p class="ghost-tamer-text-sm ghost-tamer-text-gray ghost-tamer-mt-1">Based on ${totalReports} reports from job seekers</p>
        
        <div class="ghost-tamer-text-sm ghost-tamer-mt-3">
          <strong>Most common ghosting stages:</strong>
          ${stageBreakdownHtml}
        </div>
        
        <div class="ghost-tamer-mt-3">
          <button class="ghost-tamer-button" id="ghost-tamer-details">
            View Details
          </button>
        </div>
        
        <div class="ghost-tamer-mt-2">
          <button class="ghost-tamer-button" id="ghost-tamer-report" style="background-color: #ef4444;">
            Report Ghosting
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'ghost-tamer-overlay';
  overlay.innerHTML = overlayHTML;
  
  // Add CSS styles if needed
  ensureStyles();
  
  // Append to document
  document.body.appendChild(overlay);
  
  // Add event listeners
  document.getElementById('ghost-tamer-details')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('ghostTamer:openDetails'));
  });
  
  document.getElementById('ghost-tamer-report')?.addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('ghostTamer:openReport'));
  });
  
  document.getElementById('ghost-tamer-close')?.addEventListener('click', () => {
    document.querySelector('.ghost-tamer-overlay')?.remove();
  });
}

// Helper to ensure CSS styles are injected
function ensureStyles() {
  if (document.getElementById('ghost-tamer-styles')) {
    return; // Styles already added
  }
  
  const styleEl = document.createElement('style');
  styleEl.id = 'ghost-tamer-styles';
  styleEl.textContent = `
    .ghost-tamer-overlay {
      position: fixed;
      bottom: 1rem;
      right: 1rem;
      width: 16rem;
      z-index: 9999;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
    }
    
    .ghost-tamer-card {
      background-color: white;
      border-radius: 0.5rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
      border: 1px solid #e5e7eb;
      overflow: hidden;
    }
    
    .ghost-tamer-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0.75rem 1rem;
      background-color: #4f46e5;
      color: white;
    }
    
    .ghost-tamer-title {
      font-weight: 600;
      font-size: 0.875rem;
    }
    
    .ghost-tamer-content {
      padding: 1rem;
    }
    
    .ghost-tamer-flex {
      display: flex;
    }
    
    .ghost-tamer-flex-between {
      justify-content: space-between;
      align-items: center;
    }
    
    .ghost-tamer-heading {
      font-size: 0.875rem;
      font-weight: 600;
      color: #111827;
      margin: 0;
    }
    
    .ghost-tamer-badge {
      display: inline-flex;
      align-items: center;
      padding: 0.125rem 0.625rem;
      border-radius: 9999px;
      font-size: 0.75rem;
      font-weight: 500;
    }
    
    .ghost-tamer-badge-green {
      background-color: #BBF7D0;
      color: #166534;
    }
    
    .ghost-tamer-badge-yellow {
      background-color: #FEF3C7;
      color: #92400E;
    }
    
    .ghost-tamer-badge-red {
      background-color: #FEE2E2;
      color: #B91C1C;
    }
    
    .ghost-tamer-text-sm {
      font-size: 0.75rem;
    }
    
    .ghost-tamer-text-gray {
      color: #6B7280;
    }
    
    .ghost-tamer-mt-1 {
      margin-top: 0.25rem;
    }
    
    .ghost-tamer-mt-2 {
      margin-top: 0.5rem;
    }
    
    .ghost-tamer-mt-3 {
      margin-top: 0.75rem;
    }
    
    .ghost-tamer-button {
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
      background-color: #4f46e5;
      cursor: pointer;
    }
    
    .ghost-tamer-button:hover {
      background-color: #4338ca;
    }

    .ghost-tamer-close {
      cursor: pointer;
      color: white;
      opacity: 0.7;
      transition: opacity 0.2s;
    }

    .ghost-tamer-close:hover {
      opacity: 1;
    }
  `;
  
  document.head.appendChild(styleEl);
}