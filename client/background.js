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
  
  console.log("Ghosted extension initialized");
});

// Listen for messages from content scripts
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "openPopup") {
    // Open the extension popup
    chrome.action.openPopup();
  }
  
  // Return true to indicate that we'll respond asynchronously
  return true;
});
