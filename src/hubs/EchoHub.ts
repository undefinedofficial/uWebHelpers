import { WebSocketConnection } from "uWebHelpers/service/Hub";
import { Hub } from "../../uWebHelpers";

interface MetaData {
  id: number;
}

export class EchoHub extends Hub<MetaData> {
  public OnOpen(connection: WebSocketConnection<MetaData>): void {
    connection.id = Date.now();
    console.log("connected id: ", connection.id);
  }
  public OnMessage(
    connection: WebSocketConnection<MetaData>,
    message: ArrayBuffer,
    isBinary: boolean
  ): void {
    console.log("received message: ", Buffer.from(message).toString());
    connection.send(message, isBinary);
  }
  public OnClose(
    connection: WebSocketConnection<MetaData>,
    code: number,
    message: ArrayBuffer
  ): void {
    console.log("disconnected id: ", connection.id);
  }
}
