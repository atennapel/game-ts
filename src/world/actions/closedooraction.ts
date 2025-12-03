import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";

class CloseDoorAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const { x, y } = this.position;
    const map = game.world.map;
    if (map.get(x, y) != Tile.OpenDoor)
      return false;
    map.set(x, y, Tile.ClosedDoor);
    game.refreshVisibility();
    return true;
  }
}

export default CloseDoorAction;