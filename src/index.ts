import path from "path";
import { CreateServer } from "../uWebHelpers";
import { BestController } from "./controllers/BestController";
import { HomeController } from "./controllers/HomeController";
import { EchoHub } from "./hubs/EchoHub";
import { SHARED_COMPRESSOR } from "uWebSockets.js";

const server = CreateServer({
  showmap: true,
});

server.AddHub(EchoHub, "/echo", {
  compression: SHARED_COMPRESSOR,
  maxPayloadLength: 16 * 1024,
  idleTimeout: 8,
  sendPingsAutomatically: true,
});

server.AddController(BestController, "BestController");
server.AddController(HomeController, "best HomeController");

server.AddStaticServe(path.resolve() + "/wwwroot", "/", true);
server.AddDefaultFiles();
server.AddSinglePage();

server.Run("127.0.0.1", 5000);
