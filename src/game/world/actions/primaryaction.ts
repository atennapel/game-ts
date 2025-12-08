import Game from "../../game";
import Actor from "../actors/actor";
import Tile from "../tile";
import Action from "./action";
import BumpAction from "./bumpaction";
import MoveAction from "./moveaction";
import StepAction from "./stepaction";

class PrimaryAction extends Action {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  override perform(game: Game, actor: Actor): Action[] | boolean {
    const { x: gx, y: gy } = this;

    const map = game.world.map;
    const tile = map.get(gx, gy);
    if (Tile.isBlocked(tile)) {
      map.set(gx, gy, Tile.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p.x, p.y));
        actions.push(new BumpAction(last.x, last.y));
        return actions;
      }
      return false;
    }

    return [new MoveAction(gx, gy)];
  }
}

export default PrimaryAction;