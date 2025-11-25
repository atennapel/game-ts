import Tile from "./tile";
import { array2d } from "../util";

class Map {
  readonly width: number;
  readonly height: number;
  private readonly map: Tile[][];
  private readonly visible: boolean[][];
  private readonly explored: boolean[][];

  constructor(width: number, height: number) {
    this.width = width;
    this.height = height;
    this.map = array2d(width, height, Tile.Empty);
    this.visible = array2d(width, height, false);
    this.explored = array2d(width, height, false);
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

  reset() {
    const width = this.width;
    const height = this.height;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.visible[x][y] = false;
        this.explored[x][y] = false;
      }
    }
  }
}

export default Map;
