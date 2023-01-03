import { Response } from "./responce.model";

type ControllerResult = Promise<Response> | Response;

export { ControllerResult };
