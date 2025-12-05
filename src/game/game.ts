import PathFinding from "./pathfinding";
import ShadowCasting from "./shadowcasting";
import Pos from "./world/pos";
import World from "./world/world";

class Game {
  readonly world: World;
  private readonly pathfinding: PathFinding;
  private readonly shadowcasting: ShadowCasting;

  constructor(width: number, height: number) {
    this.world = new World(width, height);
    this.pathfinding = new PathFinding(this.world.map);
    this.shadowcasting = new ShadowCasting(this.world.map);
  }

  findPath(x: number, y: number, gx: number, gy: number): Pos[] | null {
    return this.pathfinding.findPath(x, y, gx, gy);
  }

  refreshVisibility(x: number, y: number) {
    this.shadowcasting.refreshVisibility(x, y);
  }
}

export default Game;