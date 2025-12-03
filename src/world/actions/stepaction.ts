import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Action from "./action";
import Tile from "../tile";

class StepAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const world = game.world;
    const map = world.map;
    const { x, y } = this.position;
    const { x: ax, y: ay } = actor;

    if (map.isBlocked(x, y)) return false;
    if (world.actorAt(x, y)) return false;

    if (map.get(ax, ay) == Tile.Button) world.setValue(ax, ay, 0);
    actor.x = x;
    actor.y = y;
    if (actor.isPlayer()) game.refreshVisibility();
    if (map.get(x, y) == Tile.Button) world.setValue(x, y, 1);
    return true;
  }
}

export default StepAction;