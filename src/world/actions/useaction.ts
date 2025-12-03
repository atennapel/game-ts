import Actor from "../actors/actor";
import Game from "../../logic/game";
import Pos from "../pos";
import Tile from "../tile";
import Action from "./action";

class UseAction extends Action {
  readonly position: Pos;

  constructor(position: Pos) {
    super();
    this.position = position;
  }

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    const { x, y } = this.position;
    const map = game.world.map;
    const tile = map.get(x, y);
    if (tile == Tile.Computer) {
      const value = game.world.getValue(x, y);
      game.world.setValue(x, y, value == 0 ? 1 : 0);
      return true;
    } else if (tile == Tile.SwitchOff || tile == Tile.SwitchOn) {
      const value = game.world.getValue(x, y);
      game.world.setValue(x, y, value == 0 ? 1 : 0);
      game.world.map.set(x, y, value == 0 ? Tile.SwitchOn : Tile.SwitchOff);
      return true;
    }
    return false;
  }
}

export default UseAction;