import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";
import BumpAction from "./bumpaction";
import OpenDoorAction from "./opendooraction";

class MoveAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action | null {
    const x = this.position.x;
    const y = this.position.y;
    const map = game.world.map;
    if (map.get(x, y) == Tile.ClosedDoor)
      return new OpenDoorAction(this.position);
    if (map.isBlocked(x, y))
      return new BumpAction(this.position);
    actor.move(x, y);
    if (actor.isPlayer) game.refreshVisibility();
    return null;
  }
}

export default MoveAction;