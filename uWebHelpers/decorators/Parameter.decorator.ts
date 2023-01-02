import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { DescriptorResult } from "../models/decorator.model";

export function Parameter<T, A>(index = 0) {
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

      return await handler.call(target, ...args, request.getParameter(index));
    };
  };
}
