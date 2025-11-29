import Actor from "../actor";
import Game from "../game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";

class UseAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | null {
    const x = this.position.x;
    const y = this.position.y;
    const map = game.world.map;
    if (map.get(x, y) != Tile.Computer)
      return null;
    actor.bump(x, y);
    game.world.toggleSignal(0);
    return null;
  }
}

export default UseAction;