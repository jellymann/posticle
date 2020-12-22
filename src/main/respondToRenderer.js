import { ipcMain as ipc } from 'electron';

export default function respondToRenderer(eventName, callback) {
  ipc.on(eventName, async (event, data) => {
    try {
      let response = await callback(data.eventData);
      event.sender.send('message', {
        eventName: data.eventId,
        eventData: response || {}
      });
    } catch (e) {
      console.error(e);
      event.sender.send('message', {
        eventName: data.eventId,
        eventData: { error: true, errorMessage: e.message }
      });
    }
  });
}
