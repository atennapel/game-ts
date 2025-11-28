import Action from "./actions/action";

interface Actor {
  x: number;
  y: number;

  isPlayer(): boolean;

  move(x: number, y: number): void;
  bump(x: number, y: number): void;

  resetActions(): void;
  addActions(actions: Action[]): void;
  setAction(action: Action): void;
}

export default Actor;