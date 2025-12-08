import Actor from "./actors/actor";
import NPC from "./actors/npc";
import Player from "./actors/player";
import Entity from "./entities/entity";
import Table from "./entities/table";
import M from "./map";
import Tile from "./tile";

class World {
  readonly map: M;
  readonly entities: Entity[] = [];
  readonly actors: Actor[] = [];
  readonly player: Player;

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

    this.player = new Player(1, 1);
    this.actors.push(this.player);
    this.actors.push(new NPC(2, 2, width, height));
  }

  entityAt(x: number, y: number): Entity | null {
    for (let entity of this.entities) {
      if (entity.x == x && entity.y == y)
        return entity;
    }
    return null;
  }

  actorAt(x: number, y: number): Actor | null {
    for (let actor of this.actors) {
      if (actor.x == x && actor.y == y)
        return actor;
    }
    return null;
  }

  actorOrEntityAt(x: number, y: number): Actor | Entity | null {
    const actor = this.actorAt(x, y);
    return actor ? actor : this.entityAt(x, y);
  }
}

export default World;