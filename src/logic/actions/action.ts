import Actor from "../actor";
import Game from "../game";

abstract class Action {
  abstract tryPerform(game: Game, actor: Actor): Action[] | null;

  perform(game: Game, actor: Actor): void {
    let action: Action = this;
    while (true) {
      const result = action.tryPerform(game, actor);
      if (!result || result.length == 0) break;
      action = result.shift()!;
      actor.addActions(result);
    }
  }
}

export default Action;