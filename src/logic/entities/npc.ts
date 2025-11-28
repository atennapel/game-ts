import PrimaryAction from "../actions/primaryaction";
import Game from "../game";
import Pos from "../pos";
import Entity from "./entity";

class NPC extends Entity {
  override isPlayer(): boolean {
    return false;
  }

  override decideNextAction(game: Game): void {
    if (!this.isIdle()) return;
    const map = game.world.map;
    const gx = Math.floor(Math.random() * map.width);
    const gy = Math.floor(Math.random() * map.height);
    this.setAction(new PrimaryAction(new Pos(gx, gy)));
  }
}

export default NPC;