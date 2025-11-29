import World from "../../logic/world";
import Color from "../color";
import GraphicsTile from "./graphicstile";

class StaticTile extends GraphicsTile {
  private readonly mySprite: number;
  private readonly background: Color;
  private readonly foreground: Color;

  constructor(sprite: number, background: Color, foreground: Color) {
    super();
    this.mySprite = sprite;
    this.background = background;
    this.foreground = foreground;
  }

  override sprite(world: World, index: number): number {
    return this.mySprite;
  }

  override color(world: World, index: number, background: Boolean): Color {
    return background ? this.background : this.foreground;
  }
}

export default StaticTile;