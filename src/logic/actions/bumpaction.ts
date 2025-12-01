import Actor from "../actors/actor";
import Game from "../game";
import Pos from "../pos";
import Action from "./action";

class BumpAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    return true;
  }
}

export default BumpAction;