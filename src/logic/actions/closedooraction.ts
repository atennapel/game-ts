import Actor from "../actors/actor";
import Game from "../game";
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
    const x = this.position.x;
    const y = this.position.y;
    const map = game.world.map;
    if (map.get(x, y) != Tile.OpenDoor)
      return false;
    map.set(x, y, Tile.ClosedDoor);
    game.refreshVisibility();
    return true;
  }
}

export default CloseDoorAction;