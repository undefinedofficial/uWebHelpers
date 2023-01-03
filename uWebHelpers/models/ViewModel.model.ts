import { ClassArgument } from "./classArg.model";
import { Response } from "./responce.model";

export interface IViewModel {
  Validate(obj: Record<string, any>): Response | void;
}

export type ClassViewModel = ClassArgument<IViewModel, any>;
