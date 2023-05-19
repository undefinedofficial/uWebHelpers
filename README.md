# uWebHelpers

Build for [uWebSockets.js](https://github.com/uNetworking/uWebSockets.js). Controllers system and Decorators.

```diff
! WebSocket Hubs not finishet yet
```

## Example add simple controller

```javascript
/** index.ts */
import { CreateServer } from "../uWebHelpers";
import { HomeController } from "./HomeController";

const server = CreateServer();

server.AddController(HomeController /*, args */);

server.Run("127.0.0.1", 5000);
```

```javascript
/** HomeController.ts */
import { Controller, Header, Parameter, Query, Route, Watch } from "../uWebHelpers";

export class HomeController extends Controller {
  constructor(/* args */) {
    super();
    console.log("Create Home Controller");
  }

  /** (path, method (default: GET))  */
  @Route("/", "ANY")
  public Method() {
    /* Sending status, text, json, static files */
    return this.SendText("I'm any method!");
  }
}
```

## Example serve static files

```javascript
/** index.ts */
import { CreateServer } from "../uWebHelpers";

const server = CreateServer();

// (path, url (default: '/'), cached (default: false)
server.AddStaticServe(path.resolve() + "/wwwroot", "/", true);
server.AddDefaultFiles(); // serve root directory (default: disabled)
// server.AddSinglePage(); // for single page sites (default: disabled)

server.Run("127.0.0.1", 5000);
```

# See [example](https://github.com/KirillKravchenko/uWebHelpers/tree/master/src)

[index](https://github.com/KirillKravchenko/uWebHelpers/tree/master/src/index.ts), [HomeController](https://github.com/KirillKravchenko/uWebHelpers/tree/master/src/controllers/HomeController.ts)
