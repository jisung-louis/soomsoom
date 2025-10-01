type EventHandler = (payload?: any) => void;

class SimpleEventBus {
  private listeners: Map<string, Set<EventHandler>> = new Map();

  on(event: string, handler: EventHandler) {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, new Set());
    }
    this.listeners.get(event)!.add(handler);
    return () => this.off(event, handler);
  }

  off(event: string, handler: EventHandler) {
    this.listeners.get(event)?.delete(handler);
  }

  emit(event: string, payload?: any) {
    const set = this.listeners.get(event);
    if (!set) return;
    set.forEach((handler) => {
      try { handler(payload); } catch {}
    });
  }
}

export const eventBus = new SimpleEventBus();

// 이벤트 키 상수
export const APP_EVENTS = {
  REFRESH_SUMMARY: 'refresh-summary',
} as const;


