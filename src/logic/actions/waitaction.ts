import Actor from "../actor";
import Game from "../game";
import Action from "./action";

class WaitAction extends Action {
  override tryPerform(game: Game, actor: Actor): Action[] | null {
    return null;
  }
}

export default WaitAction;