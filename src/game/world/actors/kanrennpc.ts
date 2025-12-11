import Game from "../../game";
import Action from "../actions/action";
import KanrenBrain from "../brains/kanrenbrain";
import Actor from "./actor";

class KanrenNPC extends Actor {
  private readonly brain: KanrenBrain;

  constructor(x: number, y: number) {
    super(x, y);
    this.brain = new KanrenBrain();
  }

  override description(): string {
    return "kanrennpc";
  }

  override decideAction(game: Game): Action | null {
    if (this.isIdle()) {
      const action = this.brain.decideAction(game, this);
      if (action) this.setAction(action);
    }
    return this.nextAction();
  }
}

export default KanrenNPC;