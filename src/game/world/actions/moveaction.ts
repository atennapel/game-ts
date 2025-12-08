import Game from "../../game";
import Actor from "../actors/actor";
import Action from "./action";
import StepAction from "./stepaction";

class MoveAction extends Action {
  readonly x: number;
  readonly y: number;

  constructor(x: number, y: number) {
    super();
    this.x = x;
    this.y = y;
  }

  override perform(game: Game, actor: Actor): Action[] | boolean {
    const { x, y } = actor;
    const { x: gx, y: gy } = this;
    if (x == gx && y == gy) return true;
    const path = game.findPath(x, y, gx, gy);
    if (path) return path.map(p => new StepAction(p.x, p.y));
    return true;
  }
}

export default MoveAction;