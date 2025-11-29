import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Action from "./action";

class StepAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | null {
    const x = this.position.x;
    const y = this.position.y;

    if (game.world.map.isBlocked(x, y))
      return null;

    actor.move(x, y);
    if (actor.isPlayer()) game.refreshVisibilityAt(x, y);
    return null;
  }
}

export default StepAction;