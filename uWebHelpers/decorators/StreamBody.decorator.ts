import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { ControllerResult } from "../models/decorator.model";
import { ReadStream } from "../service/ReadStream.service";

export function StreamBody() {
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

      return await handler.call(target, ...args, ReadStream(responce, request));
    };
  };
}
