import World from "../../logic/world";
import Color from "../color";

abstract class GraphicsTile {
  abstract sprite(world: World, index: number): number;
  abstract color(world: World, index: number, background: boolean): Color;
}

export default GraphicsTile;