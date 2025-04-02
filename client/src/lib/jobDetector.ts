import { JobDetails, JobBoard } from '@shared/schema';

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

/**
 * Detect if current page is a job listing and extract details
 */
export function detectJobListing(): JobDetails | null {
  const url = window.location.href;
  const hostname = window.location.hostname;
  const pathname = window.location.pathname;
  
  // Determine which job board we're on
  let jobBoard: JobBoard | null = null;
  let selectors = null;
  
  for (const [board, config] of Object.entries(jobBoardConfigs)) {
    if (config.hostMatch.test(hostname) && config.pathMatch.test(pathname)) {
      jobBoard = board as JobBoard;
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

/**
 * Inject overlay with ghosting data into job listing
 */
export function injectGhostingOverlay(ghostingRate: number, totalReports: number, stageBreakdown: Record<string, number>): void {
  // Determine rating class based on ghosting rate
  let ratingClass = 'ghost-rating-0';
  if (ghostingRate >= 50) {
    ratingClass = 'ghost-rating-2';
  } else if (ghostingRate >= 20) {
    ratingClass = 'ghost-rating-1';
  }
  
  // Create overlay element
  const overlay = document.createElement('div');
  overlay.className = 'fixed bottom-4 right-4 w-64';
  overlay.innerHTML = `
    <div class="bg-white rounded-lg shadow-lg overflow-hidden border border-gray-200">
      <div class="p-4">
        <div class="flex items-center justify-between">
          <h3 class="text-sm font-semibold text-gray-900">Ghosted Rating</h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${ratingClass}">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" viewBox="0 0 20 20" fill="currentColor">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            ${ghostingRate}% ghosting
          </span>
        </div>
        <p class="mt-1 text-xs text-gray-500">Based on ${totalReports} reports from job seekers</p>
        
        <div class="mt-3 text-xs">
          ${Object.entries(stageBreakdown)
            .filter(([_, value]) => value > 0)
            .sort(([_, a], [_, b]) => b - a)
            .slice(0, 2)
            .map(([stage, percentage]) => {
              const color = percentage >= 50 ? 'text-red-700' : (percentage >= 20 ? 'text-amber-700' : 'text-green-700');
              return `
                <div class="flex justify-between items-center ${stage !== Object.entries(stageBreakdown)[0][0] ? 'mt-1' : ''}">
                  <span>${stage}:</span>
                  <span class="font-medium ${color}">${percentage}%</span>
                </div>
              `;
            }).join('')}
        </div>
        
        <div class="mt-3">
          <button class="w-full inline-flex justify-center items-center px-3 py-2 border border-transparent text-xs font-medium rounded-md text-white bg-primary hover:bg-indigo-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500" data-ghosted-action="openPopup">
            View Details
          </button>
        </div>
      </div>
    </div>
  `;
  
  // Add styles
  const style = document.createElement('style');
  style.textContent = `
    .ghost-rating-0 { background-color: #BBF7D0; color: #166534; }
    .ghost-rating-1 { background-color: #FEF3C7; color: #92400E; }
    .ghost-rating-2 { background-color: #FEE2E2; color: #B91C1C; }
  `;
  
  // Append to document
  document.head.appendChild(style);
  document.body.appendChild(overlay);
  
  // Add event listener for the View Details button
  const viewButton = overlay.querySelector('[data-ghosted-action="openPopup"]');
  if (viewButton) {
    viewButton.addEventListener('click', () => {
      chrome.runtime.sendMessage({ action: 'openPopup' });
    });
  }
}
