import { BodyStream } from "uWebHelpers/models/BodyStream.model";
import { HttpRequest, HttpResponse } from "uWebSockets.js";

/* Helper function for reading a posted body */
export function ReadStream(res: HttpResponse, req: HttpRequest): BodyStream {
  function read(edata: (chunk: ArrayBuffer) => void, eend: () => void, eerr: () => void) {
    res.onData((ab, isLast) => {
      edata(ab);
      if (isLast) {
        eend();
      }
    });
    res.onAborted(eerr);
  }
  return {
    read,
  };
}
