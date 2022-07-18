export type EventHandler = (eventType: any) => void;

export class EventService {
  static on(eventType: string, listener: EventHandler) {
    document.addEventListener(eventType, listener);
  }

  static off(eventType: string, listener: EventHandler) {
    document.removeEventListener(eventType, listener);
  }

  static once(eventType: string, listener: EventHandler) {
    EventService.on(eventType, handleEventOnce);

    function handleEventOnce(event: Event) {
      listener(event);
      EventService.off(eventType, handleEventOnce);
    }
  }

  static trigger(eventType: string, data: any) {
    const event = new CustomEvent(eventType, { detail: data });
    document.dispatchEvent(event);
  }
}
