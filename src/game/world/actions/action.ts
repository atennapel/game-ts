import Game from "../../game";
import Actor from "../actors/actor";

abstract class Action {
  abstract perform(game: Game, actor: Actor): Action[] | boolean;
}

export default Action;