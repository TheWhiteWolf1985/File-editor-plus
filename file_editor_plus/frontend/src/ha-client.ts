export type HassState = {
  entity_id: string;
  state: string;
  attributes: Record<string, any>;
  last_changed?: string;
  last_updated?: string;
};

type StateChangedEvent = {
  event: {
    data: {
      entity_id: string;
      new_state: HassState | null;
    };
  };
};

export class HAClient {
  private ws: WebSocket | null = null;
  private msgId = 1;
  private onStateChanged: ((ev: StateChangedEvent) => void) | null = null;
  private reconnectTimer: number | null = null;
  private backoff = 1000;
  private readonly base: string;

  constructor(basePath: string) {
    this.base = basePath;
  }

  private getWsUrl() {
    const proto = window.location.protocol === "https:" ? "wss" : "ws";
    const url = new URL("api/ha/ws", `${proto}://${window.location.host}${this.base}`);
    return url.toString();
  }

  async getStates(): Promise<HassState[]> {
    const res = await fetch(`${this.base}api/ha/states`);
    if (!res.ok) throw new Error(`states ${res.status}`);
    return (await res.json()) as HassState[];
  }

  connect(onStateChanged: (ev: StateChangedEvent) => void) {
    this.onStateChanged = onStateChanged;
    this.startWebSocket();
  }

  disconnect() {
    if (this.reconnectTimer !== null) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  private startWebSocket() {
    const url = this.getWsUrl();
    const ws = new WebSocket(url);
    this.ws = ws;

    ws.onopen = () => {
      this.backoff = 1000;
      // backend proxy already authenticates to HA; just subscribe
      ws.send(JSON.stringify({ id: this.msgId++, type: "subscribe_events", event_type: "state_changed" }));
    };

    ws.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        if (data.type === "event" && data.event?.event_type === "state_changed") {
          this.onStateChanged?.(data as StateChangedEvent);
        }
      } catch {
        // ignore malformed messages
      }
    };

    ws.onclose = () => {
      this.scheduleReconnect();
    };

    ws.onerror = () => {
      ws.close();
    };
  }

  private scheduleReconnect() {
    if (this.reconnectTimer !== null) return;
    this.reconnectTimer = window.setTimeout(() => {
      this.reconnectTimer = null;
      this.backoff = Math.min(this.backoff * 2, 15000);
      this.startWebSocket();
    }, this.backoff);
  }
}
