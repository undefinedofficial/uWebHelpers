import { HttpRequest, HttpResponse, RecognizedString } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ServeStatic } from "./ServeStatic.service";

export class Controller {
  private req?: HttpRequest;
  private res?: HttpResponse;

  protected SendText(
    body: RecognizedString,
    statusCode: number = 200,
    headers?: { [k: string]: RecognizedString }
  ): ControllerResult {
    return {
      code: statusCode,
      body,
      headers: { "Content-Type": "text/plain; charset=utf-8", ...headers },
    };
  }
  protected SendStatus(
    statusCode: number,
    headers?: { [k: string]: RecognizedString }
  ): ControllerResult {
    return { code: statusCode, headers };
  }
  protected SendJson(
    obj: object | Array<any>,
    statusCode: number = 200,
    headers?: { [k: string]: RecognizedString }
  ): ControllerResult {
    return {
      code: statusCode,
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json", ...headers },
    };
  }
  protected SendFile(path: string): ControllerResult {
    return new Promise((resolve) => {
      if (!this.res) return resolve({ code: 404 });
      ServeStatic(
        this.res,
        path,
        () => resolve({ code: 404 }),
        () => resolve({ code: 200 })
      );
    });
  }
}
