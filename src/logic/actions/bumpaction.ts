import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Action from "./action";

class BumpAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action | null {
    actor.bump(this.position.x, this.position.y);
    return null;
  }
}

export default BumpAction;