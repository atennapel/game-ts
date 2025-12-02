import Actor from "../actors/actor";
import Game from "../../logic/game";
import Action from "./action";

class WaitAction extends Action {
  override energyCost: number = 0;

  override tryPerform(game: Game, actor: Actor): Action[] | boolean {
    return true;
  }
}

export default WaitAction;