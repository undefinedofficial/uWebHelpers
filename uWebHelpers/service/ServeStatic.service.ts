import { createReadStream, lstatSync } from "fs";
import { HttpRequest, HttpResponse } from "uWebSockets.js";
import { FindByFormat } from "./MimeTypes.service";
import { extname } from "path";

const toArrayBuffer = (buffer: Buffer) => {
  const { buffer: arrayBuffer, byteOffset, byteLength } = buffer;
  return arrayBuffer.slice(byteOffset, byteOffset + byteLength);
};

const streamFile = (
  res: HttpResponse,
  path: string,
  size: number,
  err: () => void,
  success?: () => void
) => {
  const readStream = createReadStream(path);
  const destroyReadStream = () => {
    !readStream.destroyed && readStream.destroy();
    if (success) success();
  };

  const onError = (error: Error) => {
    destroyReadStream();
    err();
  };

  const onDataChunk = (chunk: Buffer) => {
    const arrayBufferChunk = toArrayBuffer(chunk);

    const lastOffset = res.getWriteOffset();
    const [ok, done] = res.tryEnd(arrayBufferChunk, size);

    if (!done && !ok) {
      readStream.pause();

      res.onWritable((offset) => {
        const [ok, done] = res.tryEnd(arrayBufferChunk.slice(offset - lastOffset), size);

        if (!done && ok) {
          readStream.resume();
        }

        return ok;
      });
    }
  };
  res.aborted = true;
  res.onAborted(destroyReadStream);
  readStream.on("data", onDataChunk).on("error", onError).on("end", destroyReadStream);
};

const getFileStats = (filePath: string) => {
  const stats = lstatSync(filePath, { throwIfNoEntry: false });

  if (!stats || stats.isDirectory()) return;

  const fileExtension = extname(filePath);
  const contentType = FindByFormat(fileExtension.substring(1)) || "application/octet-stream";
  const { mtime, size } = stats;
  const lastModified = mtime.toUTCString();

  return { filePath, lastModified, size, contentType };
};

function ServeStatic(res: HttpResponse, path: string, err: () => void, success?: () => void) {
  const stats = getFileStats(path);
  if (!stats) return err();
  res.writeHeader("Content-Type", stats.contentType);
  streamFile(res, path, stats.size, err, success);
}

function ServeStaticCache(
  res: HttpResponse,
  req: HttpRequest,
  path: string,
  err: () => void,
  success?: () => void
) {
  const stats = getFileStats(path);
  if (!stats) return err();

  if (req.getHeader("if-modified-since") === stats.lastModified) {
    res.cork(() => {
      res.writeStatus("304 Not Modified");
      res.end();
    });
    if (success) success();
    return;
  }

  res.writeHeader("Content-Type", stats.contentType);
  res.writeHeader("Last-Modified", stats.lastModified);
  res.writeHeader("Cache-Control", "public, max-age=2592000");
  streamFile(res, path, stats.size, err, success);
}

export { ServeStatic, ServeStaticCache };
