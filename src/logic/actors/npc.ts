import PrimaryAction from "../actions/primaryaction";
import Game from "../game";
import Pos from "../pos";
import Entity from "./actor";

class NPC extends Entity {
  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 50;
  }

  override isPlayer(): boolean {
    return false;
  }

  override decideNextActions(game: Game): boolean {
    if (!this.isIdle()) return true;
    const map = game.world.map;
    const gx = Math.floor(Math.random() * map.width);
    const gy = Math.floor(Math.random() * map.height);
    this.setAction(new PrimaryAction(new Pos(gx, gy)));
    return true;
  }
}

export default NPC;