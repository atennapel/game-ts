import Action from "../actions/action";
import MoveAction from "../actions/moveaction";
import Actor from "./actor";

class NPC extends Actor {
  private readonly width: number;
  private readonly height: number;

  constructor(x: number, y: number, width: number, height: number) {
    super(x, y);
    this.width = width;
    this.height = height;
  }

  override description(): string {
    return "npc";
  }

  override decideAction(): Action | null {
    if (this.isIdle()) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      this.setAction(new MoveAction(x, y));
    }
    return this.nextAction();
  }
}

export default NPC;