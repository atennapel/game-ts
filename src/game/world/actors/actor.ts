import Action from "../actions/action";

abstract class Actor {
  x: number;
  y: number;

  private actionStack: Action[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract description(): string;

  abstract decideAction(): Action | null;

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