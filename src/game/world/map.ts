import Tile from "./tile";

class Map {
  readonly width: number;
  readonly height: number;
  private readonly map: Tile[][];
  private readonly visible: boolean[][];
  private readonly explored: boolean[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = Map.array2d(width, height, Tile.Empty);
    this.visible = Map.array2d(width, height, false);
    this.explored = Map.array2d(width, height, false);
  }

  private static array2d<A>(width: number, height: number, value: A): A[][] {
    const result: A[][] = new Array(width);
    for (let x = 0; x < width; x++) {
      const inner: A[] = new Array(height);
      for (let y = 0; y < height; y++)
        inner[y] = value;
      result[x] = inner;
    }
    return result;
  }

  set(x: number, y: number, tile: Tile): void {
    this.map[x][y] = tile;
  }

  get(x: number, y: number): Tile {
    return this.map[x][y];
  }

  isBlocked(x: number, y: number): boolean {
    return Tile.isBlocked(this.map[x][y]);
  }

  blocksView(x: number, y: number): boolean {
    return Tile.blocksView(this.map[x][y]);
  }

  isVisible(x: number, y: number): boolean {
    return this.visible[x][y];
  }

  isExplored(x: number, y: number): boolean {
    return this.explored[x][y];
  }

  setVisible(x: number, y: number, isVisible: boolean): void {
    this.visible[x][y] = isVisible;
    if (isVisible) this.explored[x][y] = true;
  }

  setExplored(x: number, y: number, isExplored: boolean): void {
    this.explored[x][y] = isExplored;
  }
}

export default Map;