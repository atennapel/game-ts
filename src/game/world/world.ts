import Entity from "./entities/entity";
import Table from "./entities/table";
import M from "./map";
import Tile from "./tile";

class World {
  readonly map: M;
  readonly entities: Entity[] = [];

  constructor(width: number, height: number) {
    this.map = new M(width, height);

    // initialize a map for testing
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
          this.map.set(x, y, Tile.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, Tile.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, Tile.Empty);
      }
    }
    this.map.set(9, 2, Tile.Fire);

    this.entities.push(new Table(8, 9));
  }

  entityAt(x: number, y: number): Entity | null {
    for (let entity of this.entities) {
      if (entity.x == x && entity.y == y)
        return entity;
    }
    return null;
  }
}

export default World;