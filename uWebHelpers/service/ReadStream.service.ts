import { BodyStream } from "../models/BodyStream.model";
import { HttpRequest, HttpResponse } from "uWebSockets.js";

/* Helper function for reading a posted body */
export function ReadStream(res: HttpResponse, req: HttpRequest): BodyStream {
  return function (edata: (chunk: ArrayBuffer) => void, end: () => void, err: () => void) {
    res.onData((ab, isLast) => {
      edata(ab);
      if (isLast) {
        end();
      }
    });
    res.onAborted(err);
  };
}
