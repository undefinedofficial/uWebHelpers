import { HttpRequest } from "uWebSockets.js";
import { WebSocketConnection } from "uWebHelpers/service/Hub";
import { Hub } from "../../uWebHelpers";

interface MetaData {
  name: string;
}

export class EchoHub extends Hub<MetaData> {
  public OnConnect(req: HttpRequest): MetaData {
    return {
      name: "socket",
    };
  }
  public OnOpen(connection: WebSocketConnection<MetaData>): void {
    connection.id = Date.now();
    console.log("connected id: ", connection.id);
  }
  public OnClose(
    connection: WebSocketConnection<MetaData>,
    code: number,
    message: ArrayBuffer
  ): void {
    console.log("disconnected id: ", connection.id);
  }

  public Echo(ws: WebSocketConnection<MetaData>, data: any) {
    console.log(ws.name, "received message: ", data);
    ws.send(data.toString());
  }
  constructor() {
    super();
    this.SetInvoke(0, this.Echo);
  }
}
