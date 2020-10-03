export function sendMessage(eventName, eventData) {
  window.postMessage({ eventName, eventData });
}

export function addMessageListener(eventName, callback) {
  window.addEventListener(`message:${eventName}`, callback, false);
}

export function removeMessageListener(eventName, callback) {
  window.removeEventListener(`message:${eventName}`, callback);
}
