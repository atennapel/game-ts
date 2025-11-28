import NPC from "./entities/npc";
import Player from "./entities/player";
import Map from "./map";
import Tile from "./tile";

class World {
  readonly map: Map;
  readonly player: Player;
  readonly npc: NPC;

  constructor(width: number, height: number) {
    this.map = new Map(width, height);
    this.player = new Player(1, 1);
    this.npc = new NPC(2, 2);

    // initialize a map for testing
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
          this.map.set(x, y, Tile.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, Tile.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, Tile.Empty);
        if (x == 8 && y == 6)
          this.map.set(x, y, Tile.ClosedDoor);
      }
    }
  }
}

export default World;
