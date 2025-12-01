import Game from "../game";
import Entity from "./actor";

class Player extends Entity {
  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 100;
  }

  override isPlayer(): boolean {
    return true;
  }

  override decideNextActions(game: Game): boolean {
    // handled by input
    return true;
  }
}

export default Player;