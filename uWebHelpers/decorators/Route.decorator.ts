import { RecognizedString } from "uWebSockets.js";
import { Methods } from "../models/methods.model";
import { AddRoute } from "../service/Server.service";
import { ControllerResult } from "../models/decorator.model";
import { HttpCodes } from "../models/HttpCodes";

export function Route<T, A>(pattern: RecognizedString, method: Methods = "GET") {
  return function (
    target: Record<string, any>,
    propertyKey: string | symbol,
    descriptor: TypedPropertyDescriptor<(...args: any) => ControllerResult>
  ) {
    if (!descriptor.value) throw new Error("Callback not defined");
    const handler = descriptor.value;

    AddRoute(method, pattern, async (res, req) => {
      res.onAborted(() => (res.aborted = true));

      try {
        const result = await handler.call(Object.assign(target, { req, res }));
        if (res.aborted) return;
        res.cork(() => {
          res.writeStatus(result.code.toString());

          if (result.headers) {
            Object.entries(result.headers).forEach(([key, value]) => {
              res.writeHeader(key, value);
            });
          }
          result.body ? res.end(result.body) : res.end();
        });
      } catch (error) {
        res.writeStatus(HttpCodes.INTERNAL_SERVER_ERROR);
      }
    });
  };
}
