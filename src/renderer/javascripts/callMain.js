import { v4 as uuid } from 'uuid';
import deepClone from './deepClone';

export class CallMainError extends Error {}

export default function callMain(eventName, eventData) {
  return new Promise((resolve, reject) => {
    const eventId = uuid();
    const callback = (event) => {
      window.removeEventListener(eventId, callback);
      if (event.detail.error) {
        reject(new CallMainError(event.detail.errorMessage));
      } else {
        resolve(event.detail);
      }
    }
    window.addEventListener(eventId, callback, false);
    window.postMessage({ eventName, eventData: deepClone(eventData), eventId });
  });
}
