import Game from "../../logic/game";
import Entity from "./actor";

class Player extends Entity {
  constructor(x: number, y: number) {
    super(x, y);
    this.speed = 100;
  }

  override description(): string {
    return "player";
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