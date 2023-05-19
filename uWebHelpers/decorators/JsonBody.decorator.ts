import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ReadStream } from "../service/ReadStream.service";
import { HttpCodes } from "../models/HttpCodes";

export function JsonBody() {
  return function (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any) => ControllerResult>
  ) {
    if (!descriptor.value) throw new Error("Callback not defined");

    const handler = descriptor.value;
    descriptor.value = async (...args: any) => {
      const request = target["req"] as HttpRequest;
      const responce = target["res"] as HttpResponse;

      if (!request || responce["aborted"]) throw new Error("Not request");

      if (request.getHeader("content-type") !== "application/json") {
        return {
          code: HttpCodes.UNSUPPORTED_MEDIA_TYPE,
          body: "Unsupported Media Type",
        };
      }
      const stream = ReadStream(responce, request);

      let buffer: Buffer;
      return new Promise((resolve) => {
        stream(
          (chunk) => {
            if (buffer) buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            else buffer = Buffer.concat([Buffer.from(chunk)]);
          },
          async () => {
            let model;
            try {
              model = JSON.parse(buffer.toString());
            } catch {
              return resolve({
                code: HttpCodes.BAD_REQUEST,
                headers: { "content-type": "application/json" },
                body: JSON.stringify({
                  status: HttpCodes.BAD_REQUEST,
                  errors: ["Invalid JSON"],
                }),
              });
            }
            return resolve(await handler.call(target, ...args, model));
          },
          () => {}
        );
      });
    };
  };
}
