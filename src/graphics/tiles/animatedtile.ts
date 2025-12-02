import World from "../../world/world";
import Color from "../color";
import GraphicsTile from "./graphicstile";

class AnimatedTile extends GraphicsTile {
  private readonly sprites: number[];
  private readonly background: Color[];
  private readonly foreground: Color[];
  private readonly spriteAnimationSpeed: number;
  private readonly colorAnimationSpeed: number;

  constructor(sprites: number[], background: Color[], foreground: Color[], spriteAnimationSpeed: number, colorAnimationSpeed: number) {
    super();
    this.sprites = sprites;
    this.background = background;
    this.foreground = foreground;
    this.spriteAnimationSpeed = spriteAnimationSpeed;
    this.colorAnimationSpeed = colorAnimationSpeed;
  }

  override sprite(world: World, index: number): number {
    return this.sprites[Math.floor(index / this.spriteAnimationSpeed) % this.sprites.length];
  }

  override color(world: World, index: number, background: boolean): Color {
    const i = Math.floor(index / this.colorAnimationSpeed);
    return background ? this.background[i % this.background.length] : this.foreground[i % this.foreground.length];
  }
}

export default AnimatedTile;