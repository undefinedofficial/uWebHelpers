import { BodyStream } from "uWebHelpers/models/BodyStream.model";
import { HttpRequest, HttpResponse } from "uWebSockets.js";

/* Helper function for reading a posted body */
export function ReadStream(res: HttpResponse, req: HttpRequest): BodyStream {
  let length = parseInt(req.getHeader("content-length")) || undefined;
  const type = req.getHeader("content-type");
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
    type: type.length > 0 ? type : undefined,
    length: length,
    read,
  };
}
