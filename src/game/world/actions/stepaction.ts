import Game from "../../game";
import Actor from "../actors/actor";
import Action from "./action";

class StepAction extends Action {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  override perform(game: Game, actor: Actor): Action[] | boolean {
    const world = game.world;
    const map = world.map;
    const { x, y } = this;
    if (actor.x == x && actor.y == y) return true;
    if (map.isBlocked(x, y)) return false;
    if (world.actorAt(x, y)) return false;
    actor.x = x;
    actor.y = y;
    if (actor.isPlayer()) game.refreshVisibility();
    return true;
  }
}

export default StepAction;