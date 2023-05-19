import path from "path";
import {
  AjvModel,
  BodyStream,
  Controller,
  ControllerResult,
  Header,
  HttpCodes,
  IViewModel,
  JsonBody,
  MimeTypeFindType,
  Parameter,
  Query,
  Response,
  Route,
  StreamBody,
  ViewModel,
  Watch,
} from "../../uWebHelpers";
import { writeFileSync } from "fs";

/* Example simple view model */
class SimpleViewModel implements IViewModel {
  name?: string;

  /**
   * Validate model
   * @param obj object from body
   * @returns void for success else return responce
   */
  Validate(obj: Record<string, any>): void | Response {
    if (!obj["name"] || typeof obj["name"] !== "string")
      return {
        code: HttpCodes.BAD_REQUEST,
        body: "No name",
      };
    this.name = obj["name"];
  }
}

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
    return this.SendStatus(HttpCodes.BAD_REQUEST);
  }

  /** How send only status  */
  @Route("/code")
  public Code() {
    return this.SendStatus(HttpCodes.OK);
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
    return this.SendFile(path.resolve("./wwwroot/index.html"));
  }

  /** How read body stream */
  @Route("/stream", "POST")
  @Header("content-type")
  @Header("content-length")
  @StreamBody()
  public ReadStream(type: string, length: string, stream: BodyStream): ControllerResult {
    return new Promise((resolve) => {
      console.log(type, stream, length);

      let buffer: Uint8Array;
      stream(
        (chunk) => {
          if (buffer) {
            buffer = new Uint8Array(buffer.byteLength + chunk.byteLength);
            buffer.set(new Uint8Array(buffer), 0);
            buffer.set(new Uint8Array(chunk), chunk.byteLength);
          } else {
            buffer = new Uint8Array(chunk);
          }
        },
        () => {
          const format = MimeTypeFindType(type) || "txt";
          const pathfile = path.resolve("./wwwroot/file." + format);
          writeFileSync(pathfile, buffer);
          console.log("file saved:", pathfile);
          console.log("file length:", length);

          resolve(this.SendText("Thank's!"));
        },
        () => {
          console.log("The stream aborted");
        }
      );
    });
  }

  /** How read body stream */
  @Route("/json", "POST")
  @JsonBody()
  public PostJson(obj: object): ControllerResult {
    console.log("Posted json:", obj);

    return this.SendJson(obj);
  }

  /** How validate viewmodel */
  @Route("/viewmodel", "POST")
  @ViewModel(SimpleViewModel)
  public ViewModel(model: SimpleViewModel) {
    return this.SendText("Thank's " + model.name);
  }

  /** How validate on ajv schemas */
  @Route("/ajvmodel", "POST")
  @AjvModel({
    type: "object",
    properties: {
      name: { type: "string" },
    },
    required: ["name"],
    additionalProperties: false,
    errorMessage: {
      type: "should be an object",
      required: "should have property name",
      additionalProperties: "should not have properties other than name",
      properties: {
        name: "should be an string",
      },
    },
  })
  public AjvModel(model: object) {
    return this.SendJson({ model: "accept", ...model });
  }
}
