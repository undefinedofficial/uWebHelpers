import { RecognizedString } from "uWebSockets.js";
import { HttpCodes } from "./HttpCodes";

export type Response = {
  code: HttpCodes | string;
  body?: RecognizedString;
  headers?: { [k: string]: RecognizedString };
};
