import { HttpRequest, HttpResponse, RecognizedString } from "uWebSockets.js";
import { DescriptorResult } from "../models/decorator.model";

export function Watch<T, A>() {
  return function (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any) => DescriptorResult>
  ) {
    if (!descriptor.value) throw new Error("Callback not defined");

    const handler = descriptor.value;
    descriptor.value = async (...args: any) => {
      const request = target["req"] as HttpRequest;
      const responce = target["res"] as HttpResponse;

      if (!request || responce["aborted"]) throw new Error("Not request");

      console.log("Method: ", request.getMethod());
      console.log("Url: ", request.getUrl());
      console.log("Params: ", request.getQuery());

      console.log("Begin Headers: ");
      request.forEach((k, v) => {
        console.log("   ", k, v);
      });
      console.log("End Headers");

      return await handler.call(target, ...args);
    };
  };
}
