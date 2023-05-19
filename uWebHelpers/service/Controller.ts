import { HttpRequest, HttpResponse, RecognizedString } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ServeStatic } from "./ServeStatic.service";
import { HttpCodes } from "uWebHelpers/models/HttpCodes";

type HeaderList = { [k: string]: RecognizedString };

export class Controller {
  private req?: HttpRequest;
  private res?: HttpResponse;

  protected SendText(
    body: RecognizedString,
    code: string | HttpCodes = HttpCodes.OK,
    headers?: { [k: string]: RecognizedString }
  ): ControllerResult {
    return {
      code,
      body,
      headers: { "Content-Type": "text/plain; charset=utf-8", ...headers },
    };
  }
  protected SendStatus(
    code: HttpCodes | string = HttpCodes.OK,
    headers?: { [k: string]: RecognizedString }
  ): ControllerResult {
    return { code, headers };
  }
  protected SendJson(
    obj: object | Array<any>,
    code: HttpCodes | string = HttpCodes.OK,
    headers?: HeaderList
  ): ControllerResult {
    return {
      code,
      body: JSON.stringify(obj),
      headers: { "Content-Type": "application/json", ...headers },
    };
  }
  protected SendFile(path: string): ControllerResult {
    return new Promise((resolve) => {
      if (!this.res) return resolve({ code: HttpCodes.NOT_FOUND });
      ServeStatic(
        this.res,
        path,
        () => resolve({ code: HttpCodes.NOT_FOUND }),
        () => resolve({ code: HttpCodes.OK })
      );
    });
  }
  protected SendError(
    err: Error,
    statusCode: HttpCodes | string = HttpCodes.BAD_REQUEST,
    headers?: HeaderList
  ): ControllerResult {
    return this.SendJson({ error: err.message }, statusCode, headers);
  }
}
