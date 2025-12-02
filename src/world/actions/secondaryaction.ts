import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";
import CloseDoorAction from "./closedooraction";
import OpenDoorAction from "./opendooraction";
import StepAction from "./stepaction";
import WaitAction from "./waitaction";

class SecondaryAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override energyCost: number = 0;

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const gx = this.position.x;
    const gy = this.position.y;
    if (gx == actor.x && gy == actor.y)
      return [new WaitAction()];
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
    return false;
  }
}

export default SecondaryAction;