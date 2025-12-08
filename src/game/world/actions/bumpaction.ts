import Game from "../../game";
import Actor from "../actors/actor";
import Action from "./action";

class BumpAction extends Action {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  override perform(game: Game, actor: Actor): Action[] | boolean {
    return true;
  }
}

export default BumpAction;