import Game from "../game";
import Entity from "./entity";

class Player extends Entity {
  override isPlayer(): boolean {
    return true;
  }

  override decideNextAction(game: Game): void {
    // handled by input
  }
}

export default Player;