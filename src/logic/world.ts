import Entity from "./actors/actor";
import NPC from "./actors/npc";
import Player from "./actors/player";
import M from "./map";
import Tile from "./tile";

class World {
  readonly map: M;
  readonly player: Player;
  readonly actors: Entity[] = [];
  private readonly signals: Map<number, boolean> = new Map();

  constructor(width: number, height: number) {
    this.map = new M(width, height);
    this.player = new Player(1, 1);

    this.actors.push(this.player);
    this.actors.push(new NPC(2, 2));

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
    this.map.set(8, 4, Tile.Fire);
    this.map.set(7, 9, Tile.Chair);
    this.map.set(8, 9, Tile.Table);
    this.map.set(9, 9, Tile.Chair);
    this.map.set(9, 7, Tile.Computer);
    this.map.set(7, 7, Tile.Lightbulb);
  }

  getSignal(ix: number): boolean {
    return this.signals.get(ix) || false;
  }

  setSignal(ix: number, value: boolean): void {
    this.signals.set(ix, value);
  }

  toggleSignal(ix: number): void {
    this.signals.set(ix, !this.signals.get(ix));
  }
}

export default World;
