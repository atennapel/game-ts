import Actor from "../actors/actor";
import Game from "../game";
import Pos from "../pos";
import Action from "./action";

class StepAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const x = this.position.x;
    const y = this.position.y;

    if (game.world.map.isBlocked(x, y))
      return false;

    actor.x = x;
    actor.y = y;
    if (actor.isPlayer()) game.refreshVisibility();
    return true;
  }
}

export default StepAction;