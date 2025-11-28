import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Action from "./action";
import StepAction from "./stepaction";

class MoveAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | null {
    const path = game.findPath(actor.x, actor.y, this.position.x, this.position.y);
    if (path) return path.map(p => new StepAction(p));
    return null;
  }
}

export default MoveAction;