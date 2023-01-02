import {
  App,
  AppOptions,
  HttpRequest,
  HttpResponse,
  RecognizedString,
  SSLApp,
  TemplatedApp,
  WebSocketBehavior,
  us_listen_socket,
  us_listen_socket_close,
} from "uWebSockets.js";
import { Controller } from "./Controller";
import { Methods } from "../models/methods.model";
import { ServeStatic, ServeStaticCache } from "./ServeStatic.service";
import { Hub } from "./Hub";

let socket: us_listen_socket | null = null;
let server: TemplatedApp | null = null;

type CreateOptions = Partial<{
  showmap: boolean;
}>;

export function GetInstanseApp() {
  if (!server) throw new Error("before get server must to be initialized");
  return server;
}

type Handler = (res: HttpResponse, req: HttpRequest) => void;
const routes = new Map<Methods, Map<RecognizedString, Handler>>();
export function AddRoute(method: Methods, pattern: RecognizedString, handler: Handler) {
  const three = routes.get(method);
  if (three) {
    if (three.has(pattern)) throw new Error("route patterns should not repeat");
    three.set(pattern, handler);
    return;
  }
  routes.set(method, new Map([[pattern, handler]]));
}

interface ClassArgument<C> {
  new (...args: any): C;
}
type ControllerArgument<C extends Controller> = ClassArgument<C>;
type HubArgument<H extends Hub<any>> = ClassArgument<H>;
type HubOptions = Omit<
  WebSocketBehavior,
  "open" | "pong" | "close" | "drain" | "message" | "ping" | "upgrade"
>;

export function CreateServer({ showmap }: CreateOptions = {}, options?: AppOptions) {
  const app = options ? SSLApp(options) : App();
  const controllers: Array<Controller> = [];
  const hubs: Array<Hub<any>> = [];

  console.log("🗲  Server starting...");

  if (showmap) console.log(" ⁝ Server show map routes...");
  routes.forEach((pairs, method) => {
    if (showmap) console.log(method + ": ");

    switch (method) {
      case "GET":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.get(pattern, handler);
        });
        break;
      case "HEAD":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.head(pattern, handler);
        });
        break;
      case "POST":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.post(pattern, handler);
        });
        break;
      case "PUT":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.put(pattern, handler);
        });
        break;
      case "PATCH":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.patch(pattern, handler);
        });
        break;
      case "DELETE":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.del(pattern, handler);
        });
        break;
      case "CONNECT":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.connect(pattern, handler);
        });
        break;
      case "TRACE":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.trace(pattern, handler);
        });
        break;
      case "OPTIONS":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.options(pattern, handler);
        });
        break;
      case "ANY":
        pairs.forEach((handler, pattern) => {
          if (showmap) console.log("    " + pattern);
          app.any(pattern, handler);
        });
        break;
    }
  });
  if (showmap) console.log();

  const Run = (
    host: string,
    port: number,
    serverNameCallback?: (hostname: string) => void
  ) => {
    if (serverNameCallback) app?.missingServerName(serverNameCallback);
    app?.listen(host, port, (listenSocket) => {
      socket = listenSocket;

      console.info(
        socket
          ? `\t🌐 Listening to http${options ? "s" : ""}://${host}:${port}`
          : `\t Failed to listen to port ${port}`
      );
    });

    server = app;

    routes.clear();
  };
  const Stop = () => {
    if (socket) {
      us_listen_socket_close(socket);
      return true;
    }
    return false;
  };
  const AddServerName = (hostname: string, options: AppOptions) => {
    return app?.addServerName(hostname, options);
  };

  function AddController<C extends Controller>(
    controller: ControllerArgument<C>,
    ...args: any[]
  ) {
    controllers.push(new controller(args));
  }
  function AddHub<H extends Hub<any>>(
    hub: HubArgument<H>,
    pattern: string,
    options?: HubOptions,
    ...args: any[]
  ) {
    const handlers = new hub(...args);
    app.ws(pattern, {
      ...options,
      upgrade: handlers.upgrade,
      open: handlers.open,
      message: handlers.message,
      drain: handlers.drain,
      close: handlers.close,
    });
    hubs.push(handlers);
  }

  let isDefault: string;
  let isSinglePage = false;
  function AddStaticServe(
    path: string = "./",
    pattern: string = "/",
    cache: boolean = false
  ): void {
    function NotFound(res: HttpResponse) {
      res.cork(() => {
        res.writeStatus("404");
        res.end();
      });
    }
    if (cache) {
      app.get(pattern + "*", (res, req) => {
        let url = req.getUrl();

        if (isDefault && url[url.length - 1] === "/") url += isDefault;
        ServeStaticCache(res, req, path + url, () => {
          if (isSinglePage)
            return ServeStatic(res, path + "/" + isDefault, () => NotFound(res));

          NotFound(res);
        });
      });
      return;
    }
    app.get(pattern + "*", (res, req) => {
      let url = req.getUrl();

      if (isDefault && url[url.length - 1] === "/") url += isDefault;
      ServeStatic(res, path + url, () => {
        if (isSinglePage)
          return ServeStatic(res, path + "/" + isDefault, () => NotFound(res));

        NotFound(res);
      });
    });
  }
  /**
   * for vue-router and more...
   */
  function AddSinglePage() {
    isSinglePage = true;
    if (!isDefault) isDefault = "index.html";
  }
  /**
   * auto add if simple hash
   * @param defaultfile default "index.html"
   */
  function AddDefaultFiles(defaultfile = "index.html") {
    isDefault = defaultfile;
  }

  return {
    Run,
    Stop,
    AddServerName,
    AddController,
    AddHub,
    AddStaticServe,
    AddSinglePage,
    AddDefaultFiles,
  };
}
