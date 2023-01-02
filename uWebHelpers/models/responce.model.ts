import { RecognizedString } from "uWebSockets.js";

export type Response = {
  code: number;
  body?: RecognizedString;
  headers?: { [k: string]: RecognizedString };
};
