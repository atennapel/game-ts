import M from "./map";
import Tile from "./tile";

class World {
  readonly map: M;

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
  }
}

export default World;