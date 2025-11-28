import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";
import CloseDoorAction from "./closedooraction";
import OpenDoorAction from "./opendooraction";
import StepAction from "./stepaction";

class SecondaryAction extends Action {
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
        return actions;
      }
    } else if (tile == Tile.OpenDoor) {
      const path = game.findPath(actor.x, actor.y, gx, gy);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p));
        actions.push(new CloseDoorAction(last));
        return actions;
      }
    }
    return null;
  }
}

export default SecondaryAction;