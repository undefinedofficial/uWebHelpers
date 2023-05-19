import Ajv, { AnySchema } from "ajv";
import AjvErrors from "ajv-errors";

export const ajv = new Ajv({ allErrors: true });
AjvErrors(ajv);
export type AjvSchema = AnySchema;
