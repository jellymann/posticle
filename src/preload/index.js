/* eslint-env node */

// https://electronjs.org/docs/tutorial/security
// Preload File that should be loaded into browser window instead of
// setting nodeIntegration: true for browser window

import { ipcRenderer } from 'electron'

process.once('loaded', () => {
  window.addEventListener('message', event => {
    let message = event.data;

    ipcRenderer.send(message.eventName, message);
  });

  ipcRenderer.on('message', (event, data) => {
    window.dispatchEvent(new CustomEvent(
      data.eventName,
      { detail: data.eventData }
    ));
  });
});
