import Game from "../../game";
import Action from "../actions/action";

abstract class Actor {
  x: number;
  y: number;
  readonly id: number;

  private static nextId: number = 0;

  private actionStack: Action[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
    this.id = Actor.nextId++;
  }

  abstract description(): string;

  abstract decideAction(game: Game): Action | null;

  isPlayer(): boolean {
    return false;
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

  nextAction(): Action | null {
    return this.actionStack.pop() || null;
  }
}

export default Actor;