// Content script is executed on the active page
chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    if (message.action === "scrapeText") {
        const textToDownload = document.body.innerText;
        sendResponse(textToDownload);
    }
});
