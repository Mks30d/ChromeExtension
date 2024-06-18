let screenshots = [];

chrome.runtime.onInstalled.addListener(() => {
  console.log("Extension Installed");
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "captureScreenshot") {
    chrome.tabs.captureVisibleTab(null, { format: 'png' }, (image) => {
      if (chrome.runtime.lastError) {
        sendResponse({ success: false, error: chrome.runtime.lastError.message });
      } else {
        screenshots.push(image);
        sendResponse({ success: true, screenshotCount: screenshots.length });
      }
    });
    return true; // Keeps the message channel open for sendResponse
  }

  if (message.action === "getScreenshots") {
    sendResponse({ success: true, screenshots });
  }

  if (message.action === "clearScreenshots") {
    screenshots = [];
    sendResponse({ success: true });
  }
});
