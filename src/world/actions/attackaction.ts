import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Action from "./action";

class AttackAction extends Action {
  readonly position: Pos;
  readonly target: Actor;

  constructor(position: Pos, target: Actor) {
    super();
    this.position = position;
    this.target = target;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const { x, y } = this.position;
    const target = game.world.actorAt(x, y);
    if (!target || this.target != target) return false;
    return true;
  }
}

export default AttackAction;