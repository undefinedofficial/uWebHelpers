import path from "path";
import { Controller, Header, Parameter, Query, Route, Watch } from "../../uWebHelpers";

/** perfect controller :) */
export class HomeController extends Controller {
  constructor(name: string) {
    super();
    console.log("The - " + name);
  }

  /** How add handler in any request  */
  @Route("/any", "ANY")
  public AnyMethod() {
    return this.SendText("I'm any method!");
  }
  /** How add handler in any request  */
  @Route("/bad", "ANY")
  public BadMethod() {
    return this.SendStatus(400);
  }

  /** How send only status  */
  @Route("/code")
  public Code() {
    return this.SendStatus(200);
  }

  /** How send json  */
  @Route("/json")
  public Json() {
    return this.SendJson({
      hello: "world",
    });
  }

  /** How receive dynamic path */
  @Route("/param/:id")
  @Parameter(0)
  public One(id: string) {
    return this.SendText("id: " + id);
  }

  /** How multiple decorators */
  @Route("/param/:family/:name")
  @Parameter(0)
  @Parameter(1)
  public Two(family: string, name: string) {
    return this.SendText("family: " + family + "\nname: " + name);
  }

  /** How multiple decorators */
  @Route("/say/:say")
  @Parameter(0)
  @Header("sec-ch-ua-platform")
  public Say(say: string, platform: string) {
    return this.SendText("you platform: " + platform + "\nYou say: " + say);
  }

  /** How receive request headers */
  @Route("/agent")
  @Header("user-agent")
  public Agent(agent: string) {
    return this.SendText("Your agent: " + agent);
  }

  /** How receive query params */
  @Route("/query")
  @Query("q")
  public QueryParams(query: string) {
    return this.SendText("q value: " + query);
  }

  /** How watch requests */
  @Route("/notice")
  @Watch()
  public Watch() {
    return this.SendText("Server you notice : )");
  }

  /** How send file */
  @Route("/file")
  public File() {
    console.log(path.resolve());

    return this.SendFile(path.resolve() + "/wwwroot/index.html");
  }
}
