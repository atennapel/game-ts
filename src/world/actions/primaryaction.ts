import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";
import BumpAction from "./bumpaction";
import MoveAction from "./moveaction";
import OpenDoorAction from "./opendooraction";
import StepAction from "./stepaction";
import UseAction from "./useaction";
import AttackAction from "./attackaction";

class PrimaryAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override energyCost: number = 0;

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const { x: gx, y: gy } = this.position;

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
      return false;
    } else if (tile == Tile.Computer || tile == Tile.SwitchOff || tile == Tile.SwitchOn) {
      map.set(gx, gy, Tile.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p));
        actions.push(new UseAction(last));
        return actions;
      }
      return false;
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
      return false;
    }

    const target = game.world.actorAt(gx, gy);
    if (target) {
      const path = game.findPath(actor.x, actor.y, gx, gy);
      if (path && path.length > 0) {
        const last = path.pop()!;
        const actions = path.map(p => new StepAction(p));
        actions.push(new AttackAction(last, target));
        return actions;
      }
      return false;
    }

    return [new MoveAction(this.position)];
  }
}

export default PrimaryAction;