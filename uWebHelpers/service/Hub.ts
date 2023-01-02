import {
  HttpRequest,
  HttpResponse,
  RecognizedString,
  WebSocket,
  WebSocketBehavior,
  us_socket_context_t,
} from "uWebSockets.js";

export type WebSocketConnection<T> = Partial<T> & WebSocket;

export abstract class Hub<T>
  implements
    Required<Pick<WebSocketBehavior, "open" | "close" | "message" | "upgrade" | "drain">>
{
  public upgrade(res: HttpResponse, req: HttpRequest, context: us_socket_context_t) {
    res.onAborted(() => (res.aborted = true));
    /* You MUST copy data out of req here, as req is only valid within this immediate callback */
    const secWebSocketKey = req.getHeader("sec-websocket-key");
    const secWebSocketProtocol = req.getHeader("sec-websocket-protocol");
    const secWebSocketExtensions = req.getHeader("sec-websocket-extensions");

    /* This immediately calls open handler, you must not use res after this call */
    return res.upgrade(
      {},
      /* Use our copies here */
      secWebSocketKey,
      secWebSocketProtocol,
      secWebSocketExtensions,
      context
    );
  }

  public open(ws: WebSocket) {
    this.OnOpen(ws as WebSocketConnection<T>);
  }
  public close(ws: WebSocket, code: number, message: ArrayBuffer) {
    this.OnClose(ws as WebSocketConnection<T>, code, message);
  }
  public message(ws: WebSocket, message: ArrayBuffer, isBinary: boolean) {
    this.OnMessage(ws as WebSocketConnection<T>, message, isBinary);
  }
  public drain(ws: WebSocket) {
    console.warn("Drain not implemented!");
  }

  public abstract OnOpen(connection: WebSocketConnection<T>): void;
  public abstract OnMessage(
    connection: WebSocketConnection<T>,
    message: ArrayBuffer,
    isBinary: boolean
  ): void;
  public abstract OnClose(
    connection: WebSocketConnection<T>,
    code: number,
    message: ArrayBuffer
  ): void;
}
