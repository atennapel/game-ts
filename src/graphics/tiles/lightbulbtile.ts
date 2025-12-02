import World from "../../world/world";
import Color from "../color";
import GraphicsTile from "./graphicstile";

class LightbulbTile extends GraphicsTile {
  private readonly signal: number;

  constructor(signal: number) {
    super();
    this.signal = signal;
  }

  sprite(world: World, index: number): number {
    return 11;
  }
  color(world: World, index: number, background: boolean): Color {
    return background ? Color.Transparent : world.getSignal(this.signal) ? Color.BrightYellow : Color.DarkGrey;
  }
}

export default LightbulbTile;