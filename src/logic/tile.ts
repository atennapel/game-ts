enum Tile {
  Empty = 0,
  Wall,
  ClosedDoor,
  OpenDoor,
  Fire,
}

namespace Tile {
  export function isBlocked(tile: Tile): boolean {
    return tile == Tile.Wall || tile == Tile.ClosedDoor || tile == Tile.Fire;
  }

  export function blocksView(tile: Tile): boolean {
    return tile == Tile.Wall || tile == Tile.ClosedDoor;
  }

  export function description(tile: Tile): string | null {
    if (tile == Tile.ClosedDoor) return "door (closed)";
    else if (tile == Tile.OpenDoor) return "door (open)";
    else if (tile == Tile.Fire) return "fire";
    return null;
  }
}

export default Tile;
