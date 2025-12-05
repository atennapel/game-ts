import Wired from "../wired";
import Entity from "./entity";

class Lightbulb extends Entity implements Wired {
  value: number = 0;
  readonly outgoingWires: Wired[] = [];
  readonly incomingWires: Wired[] = [];

  description(): string {
    return `lightbulb (${this.value == 0 ? "off" : "on"})`;
  }
}

export default Lightbulb;