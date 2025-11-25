enum Tile {
  Empty = 0,
  Wall,
}

namespace Tile {
  export function isBlocked(tile: Tile): boolean {
    return tile == Tile.Wall;
  }
}

export default Tile;
