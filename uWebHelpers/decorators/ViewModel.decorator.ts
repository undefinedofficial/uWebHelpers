import { HttpRequest, HttpResponse, RecognizedString } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ClassViewModel } from "../models/ViewModel.model";
import { ReadStream } from "../service/ReadStream.service";

export function ViewModel<T>(viewmodel: ClassViewModel, ...vmArgs: any[]) {
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
          code: 415,
          body: "Unsupported Media Type",
        };
      }

      const stream = ReadStream(responce, request);
      let buffer: Buffer;
      return new Promise((resolve) => {
        stream.read(
          (chunk) => {
            if (buffer) buffer = Buffer.concat([buffer, Buffer.from(chunk)]);
            else buffer = Buffer.concat([Buffer.from(chunk)]);
          },
          async () => {
            try {
              const model = new viewmodel(...vmArgs);

              const result = model.Validate(JSON.parse(buffer.toString()));
              if (result) return resolve(result);

              return resolve(await handler.call(target, ...args, model));
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
