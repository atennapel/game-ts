import Action from "../actions/action";
import Game from "../game";

abstract class Actor {
  x: number;
  y: number;
  speed: number = 100;
  energy: number = 0;
  maxEnergy: number = 100;

  private actionStack: Action[] = [];

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract isPlayer(): boolean;

  abstract decideNextActions(game: Game): boolean;

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

  canTakeTurn(): boolean {
    return this.energy >= this.maxEnergy;
  }

  gainEnergy(): boolean {
    this.energy += this.speed;
    return this.canTakeTurn();
  }

  useEnergy(cost: number): void {
    this.energy = (this.energy - cost) % this.maxEnergy;
  }

  takeTurn(game: Game): Action | null {
    if (!this.decideNextActions(game)) return null;
    return this.actionStack.pop() || null;
  }
}

export default Actor;