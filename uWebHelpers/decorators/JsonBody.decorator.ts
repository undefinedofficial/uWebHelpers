import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ReadStream } from "../service/ReadStream.service";

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

      const stream = ReadStream(responce, request);
      if (stream.type !== "application/json") {
        return {
          code: 415,
          body: "Unsupported Media Type",
        };
      }

      let buffer: Buffer;
      return new Promise((resolve) => {
        stream.read(
          (chunk) => {
            if (buffer) buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            else buffer = Buffer.concat([Buffer.from(chunk)]);
          },
          async () => {
            try {
              return resolve(
                await handler.call(target, ...args, JSON.parse(buffer.toString()))
              );
            } catch {
              resolve({
                code: 415,
                body: "Unsupported Media Type",
              });
            }
          },
          () => {}
        );
      });
    };
  };
}
