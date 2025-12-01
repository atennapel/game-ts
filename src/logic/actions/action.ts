import Actor from "../actors/actor";
import Game from "../game";

abstract class Action {
  readonly energyCost: number = 100;

  abstract tryPerform(game: Game, actor: Actor): Action[] | boolean;

  perform(game: Game, actor: Actor): boolean {
    const result = this.tryPerform(game, actor);
    if (!Array.isArray(result)) return result;
    if (result.length == 0) return false;
    actor.addActions(result);
    return false;
  }
}

export default Action;