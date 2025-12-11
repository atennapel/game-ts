import Game from "../../game";
import Action from "../actions/action";
import Actor from "../actors/actor";

abstract class Brain {
  abstract decideAction(game: Game, actor: Actor): Action | null;
}

export default Brain;