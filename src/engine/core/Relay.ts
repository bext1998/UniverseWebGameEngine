type EventHandler<TPayload> = (payload: TPayload) => void;

type ListenerMap<EventMap extends object> = Partial<{
  [K in keyof EventMap]: Set<EventHandler<EventMap[K]>>;
}>;

export class Relay<EventMap extends object> {
  private readonly listeners: ListenerMap<EventMap> = {};

  on<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): () => void {
    this.getListeners(event).add(handler);

    return () => {
      this.off(event, handler);
    };
  }

  off<K extends keyof EventMap>(
    event: K,
    handler: EventHandler<EventMap[K]>
  ): void {
    this.listeners[event]?.delete(handler);
  }

  emit<K extends keyof EventMap>(event: K, payload: EventMap[K]): void {
    const listeners = this.listeners[event];

    if (!listeners) {
      return;
    }

    for (const handler of [...listeners]) {
      handler(payload);
    }
  }

  clear<K extends keyof EventMap>(event?: K): void {
    if (event === undefined) {
      for (const eventKey in this.listeners) {
        this.listeners[eventKey]?.clear();
      }
      return;
    }

    this.listeners[event]?.clear();
  }

  private getListeners<K extends keyof EventMap>(
    event: K
  ): Set<EventHandler<EventMap[K]>> {
    const existing = this.listeners[event];

    if (existing) {
      return existing;
    }

    const created = new Set<EventHandler<EventMap[K]>>();
    this.listeners[event] = created;
    return created;
  }
}
