import Action from "../actions/action";
import Actor from "../actor";
import Game from "../game";

abstract class Entity implements Actor {
  x: number;
  y: number;

  private actionStack: Action[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  resetActions(): void {
    this.actionStack = [];
  }

  isIdle(): boolean {
    return this.actionStack.length == 0;
  }

  addActions(actions: Action[]): void {
    for (let i = actions.length - 1; i >= 0; i--)
      this.actionStack.push(actions[i]);
  }

  setAction(action: Action): void {
    this.actionStack = [action];
  }

  takeTurn(game: Game, actor: Actor): boolean {
    this.decideNextAction(game);

    const action = this.actionStack.pop() || null;
    if (action) {
      action.perform(game, actor);
      return true;
    } else return false;
  }

  move(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  bump(x: number, y: number): void { }

  abstract isPlayer(): boolean;
  abstract decideNextAction(game: Game): void;
}

export default Entity;