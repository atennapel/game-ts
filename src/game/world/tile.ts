enum Tile {
  Empty = 0,
  Wall,
  Fire,
}

namespace Tile {
  export function isBlocked(tile: Tile): boolean {
    switch (tile) {
      case Tile.Wall: return true;
      case Tile.Fire: return true;
      default: return false;
    }
  }

  export function blocksView(tile: Tile): boolean {
    return tile == Tile.Wall;
  }

  export function description(tile: Tile): string | null {
    switch (tile) {
      case Tile.Fire: return "fire";
      default: return null;
    }
  }
}

export default Tile;