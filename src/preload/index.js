// https://electronjs.org/docs/tutorial/security
// Preload File that should be loaded into browser window instead of
// setting nodeIntegration: true for browser window

import { ipcRenderer } from 'electron'

process.once('loaded', () => {
  window.addEventListener('message', event => {
    let message = event.data;

    if (message.fromMain) {
      console.log("message from main", message);
      window.dispatchEvent(new CustomEvent(
        `message:${message.eventName}`,
        { detail: message.eventData }
      ));
    } else {
      console.log("message from renderer", message);
      ipcRenderer.send(message.eventName, message.eventData);
    }
  });

  ipcRenderer.on('message', (event, data) => {
    console.log("posting message from main", data);
    window.postMessage({
      fromMain: true,
      eventName: data.eventName,
      eventData: data.eventData
    });
  });
});
