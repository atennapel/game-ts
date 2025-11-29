import Color from "../color";

abstract class GraphicsTile {
  abstract sprite(index: number): number;
  abstract color(index: number, background: boolean): Color;
}

export default GraphicsTile;