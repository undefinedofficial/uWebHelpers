import {
  HttpRequest,
  HttpResponse,
  RecognizedString,
  TemplatedApp,
  WebSocket,
  us_socket_context_t,
} from "uWebSockets.js";
import { GetInstanseApp } from "./Server.service";

export type WebSocketConnection<T> = Partial<T> &
  WebSocket & {
    id: number;
  };

type InvokeKey = string | number;
type InvokeCallback<T> = (ws: WebSocketConnection<T>, payload: any) => void;

interface IHub<T> {
  OnConnect(req: HttpRequest): T;
  OnOpen(connection: WebSocketConnection<T>): void;
  OnClose(connection: WebSocketConnection<T>, code: number, message: ArrayBuffer): void;
}

export abstract class Hub<T> implements IHub<T> {
  private emits: Record<InvokeKey, InvokeCallback<T>> = {};
  SetInvoke(key: InvokeKey, event: InvokeCallback<T>) {
    this.emits[key] = event;
  }

  private App: TemplatedApp = GetInstanseApp();
  private upgrade(res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
    res.onAborted(() => (res.aborted = true));
    /* You MUST copy data out of req here, as req is only valid within this immediate callback */
    const secWebSocketKey = req.getHeader("sec-websocket-key");
    const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
    const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

    /* This immediately calls open handler, you must not use res after this call */
    return res.upgrade(
      this.OnConnect(req),
      /* Use our copies here */
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context
    );
  }
  private open(ws: WebSocketConnection<T>) {
    this.OnOpen(ws as WebSocketConnection<T>);
  }
  private close(ws: WebSocketConnection<T>, code: number, message: ArrayBuffer) {
    this.OnClose(ws as WebSocketConnection<T>, code, message);
  }
  private message(ws: WebSocketConnection<T>, message: ArrayBuffer, isBinary: boolean) {
    try {
      const data = JSON.parse(Buffer.from(message).toString());
      if (this.emits[data.f]) this.emits[data.f](ws, data.p);
    } catch {}
  }
  private drain(ws: WebSocketConnection<T>) {
    console.warn("Drain not implemented!");
  }

  // private groups = new Map<number, Array<WebSocketConnection<T>>>();

  abstract OnConnect(req: HttpRequest): T;
  abstract OnOpen(connection: WebSocketConnection<T>): void;
  abstract OnClose(
    connection: WebSocketConnection<T>,
    code: number,
    message: ArrayBuffer
  ): void;
}
