import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";
import BumpAction from "./bumpaction";
import MoveAction from "./moveaction";
import OpenDoorAction from "./opendooraction";
import StepAction from "./stepaction";

class PrimaryAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | null {
    const gx = this.position.x;
    const gy = this.position.y;

    const map = game.world.map;
    const tile = map.get(gx, gy);
    if (tile == Tile.ClosedDoor) {
      map.set(gx, gy, Tile.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p));
        actions.push(new OpenDoorAction(last));
        actions.push(new StepAction(last));
        return actions;
      }
      return null;
    } else if (Tile.isBlocked(tile)) {
      map.set(gx, gy, Tile.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p));
        actions.push(new BumpAction(last));
        return actions;
      }
      return null;
    }

    return [new MoveAction(this.position)];
  }
}

export default PrimaryAction;