interface Actor {
  isPlayer: boolean;
  move(x: number, y: number): void;
  bump(x: number, y: number): void;
}

export default Actor;