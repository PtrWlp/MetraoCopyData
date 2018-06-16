'use strict'

chrome.browserAction.onClicked.addListener(function (tab) {
  chrome.tabs.query({active: true, currentWindow: true }, function (tabs) {
    chrome.tabs.executeScript(tabs[0].id, {file: 'metrao-inject.js'})
  })
});
  