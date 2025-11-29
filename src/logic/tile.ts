enum Tile {
  Empty = 0,
  Wall,
  ClosedDoor,
  OpenDoor,
  Fire,
  Chair,
  Table,
}

namespace Tile {
  export function isBlocked(tile: Tile): boolean {
    return tile == Tile.Wall || tile == Tile.ClosedDoor || tile == Tile.Fire || tile == Tile.Table;
  }

  export function blocksView(tile: Tile): boolean {
    return tile == Tile.Wall || tile == Tile.ClosedDoor;
  }

  export function description(tile: Tile): string | null {
    switch (tile) {
      case Tile.ClosedDoor: return "door (closed)";
      case Tile.OpenDoor: return "door (open)";
      case Tile.Fire: return "fire";
      case Tile.Chair: return "chair";
      case Tile.Table: return "table";
      default: return null;
    }
  }
}

export default Tile;
