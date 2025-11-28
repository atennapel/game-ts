import Actor from "../actor";
import Game from "../game";

abstract class Action {
  abstract tryPerform(game: Game, actor: Actor): Action | null;

  perform(game: Game, actor: Actor): void {
    let action: Action | null = this;
    while (action) action = action.tryPerform(game, actor);
  }
}

export default Action;