abstract class Entity {
  x: number;
  y: number;

  constructor(x: number, y: number) {
    this.x = x;
    this.y = y;
  }

  abstract description(): string;
}

export default Entity;