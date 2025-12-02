import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Action from "./action";
import StepAction from "./stepaction";

class MoveAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override energyCost: number = 0;

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    if (actor.x == this.position.x && actor.y == this.position.y) return false;
    const path = game.findPath(actor.x, actor.y, this.position.x, this.position.y);
    if (path) return path.map(p => new StepAction(p));
    return true;
  }
}

export default MoveAction;