import { RecognizedString } from "uWebSockets.js";
import { Methods } from "../models/methods.model";
import { AddRoute } from "../service/Server.service";
import { DescriptorResult } from "../models/decorator.model";

export function Route<T, A>(pattern: RecognizedString, method: Methods = "GET") {
  return function (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any) => DescriptorResult>
  ) {
    if (!descriptor.value) throw new Error("Callback not defined");
    const handler = descriptor.value;

    AddRoute(method, pattern, async (res, req) => {
      res.onAborted(() => (res.aborted = true));

      target["req"] = req;
      target["res"] = res;

      const result = await handler.call(target);

      if (res.aborted) return;
      res.cork(() => {
        res.writeStatus(result.code.toString());

        if (result.headers) {
          Object.entries(result.headers).forEach((header) => {
            res.writeHeader(header[0], header[1]);
          });
        }
        result.body ? res.end(result.body) : res.end();
      });
    });
  };
}
