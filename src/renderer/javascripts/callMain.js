import { v4 as uuid } from 'uuid';

export default function callMain(eventName, eventData) {
  return new Promise((resolve, reject) => {
    const eventId = uuid();
    const callback = (event) => {
      window.removeEventListener(eventId, callback);
      if (event.detail.error) {
        reject(new Error(event.detail.errorMessage));
      } else {
        resolve(event.detail);
      }
    }
    window.addEventListener(eventId, callback, false);
    window.postMessage({ eventName, eventData, eventId });
  });
}
