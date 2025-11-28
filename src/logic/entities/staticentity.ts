import Game from "../game";
import Entity from "./entity";

class StaticEntity extends Entity {
  override isPlayer(): boolean {
    return false;
  }

  override decideNextAction(game: Game): void {
    // static
  }
}

export default StaticEntity;