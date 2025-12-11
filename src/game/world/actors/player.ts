import Game from "../../game";
import Action from "../actions/action";
import Actor from "./actor";

class Player extends Actor {
  override description(): string {
    return "player";
  }

  override isPlayer(): boolean {
    return true;
  }

  override decideAction(game: Game): Action | null {
    return this.nextAction();
  }
}

export default Player;