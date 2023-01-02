import { Controller, Route } from "../../uWebHelpers";

export class BestController extends Controller {
  constructor(name: string) {
    super();
    console.log("The - " + name);
  }

  @Route("/best")
  public Index() {
    return this.SendText("I'm best");
  }
}
