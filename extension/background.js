// Background service worker for tab activity tracking
// Only tracks when user enables tracking via popup

let trackingEnabled = false;

// Initialize on install
chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.set({ 
    trackingEnabled: false,
    logs: []
  });
  console.log('Focus Analyzer installed');
});

// Listen for tracking state changes from popup
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === 'startTracking') {
    trackingEnabled = true;
    chrome.storage.local.set({ trackingEnabled: true });
    console.log('✓ Tracking started');
    sendResponse({ status: 'started' });
  } else if (message.action === 'stopTracking') {
    trackingEnabled = false;
    chrome.storage.local.set({ trackingEnabled: false });
    console.log('✓ Tracking stopped');
    sendResponse({ status: 'stopped' });
  } else if (message.action === 'getStatus') {
    chrome.storage.local.get(['trackingEnabled'], (result) => {
      sendResponse({ trackingEnabled: result.trackingEnabled || false });
    });
    return true; // Keep message channel open for async response
  }
});

// Track active tab changes
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // Check if tracking is enabled
  const { trackingEnabled } = await chrome.storage.local.get('trackingEnabled');
  
  if (!trackingEnabled) {
    return; // Don't track if disabled
  }

  try {
    const tab = await chrome.tabs.get(activeInfo.tabId);
    
    if (!tab.url || tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
      return; // Skip internal Chrome pages
    }

    // Extract domain from URL
    let domain = 'unknown';
    try {
      const url = new URL(tab.url);
      domain = url.hostname;
    } catch (e) {
      console.warn('Could not parse URL:', tab.url);
    }

    // Create log entry in exact format backend expects
    const logEntry = {
      timestamp: new Date().toISOString(),
      url: tab.url,
      domain: domain
    };

    // Append to stored logs
    const { logs = [] } = await chrome.storage.local.get('logs');
    logs.push(logEntry);
    
    await chrome.storage.local.set({ logs });
    console.log('✓ Tracked:', domain);
  } catch (error) {
    console.error('Error tracking tab:', error);
  }
});

// Track tab URL updates (e.g., navigating within same tab)
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  // Only track when URL changes and page is complete
  if (changeInfo.status !== 'complete' || !changeInfo.url) {
    return;
  }

  const { trackingEnabled } = await chrome.storage.local.get('trackingEnabled');
  
  if (!trackingEnabled) {
    return;
  }

  // Check if this is the active tab
  const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (activeTab.id !== tabId) {
    return; // Only track active tab
  }

  if (tab.url.startsWith('chrome://') || tab.url.startsWith('about:')) {
    return;
  }

  let domain = 'unknown';
  try {
    const url = new URL(tab.url);
    domain = url.hostname;
  } catch (e) {
    console.warn('Could not parse URL:', tab.url);
  }

  const logEntry = {
    timestamp: new Date().toISOString(),
    url: tab.url,
    domain: domain
  };

  const { logs = [] } = await chrome.storage.local.get('logs');
  logs.push(logEntry);
  
  await chrome.storage.local.set({ logs });
  console.log('✓ Tracked navigation:', domain);
});
