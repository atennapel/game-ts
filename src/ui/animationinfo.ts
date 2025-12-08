import Action from "../game/world/actions/action";
import BumpAction from "../game/world/actions/bumpaction";
import StepAction from "../game/world/actions/stepaction";
import Actor from "../game/world/actors/actor";
import Color from "./color";

class AnimationInfo {
  private readonly actor: Actor;

  absoluteX: number;
  absoluteY: number;
  private goalX: number;
  private goalY: number;

  private spriteWidth: number;
  private spriteHeight: number;

  private moving: boolean = false;
  private bumping: boolean = false;

  animationSpeed: number = 0.25;
  bumpRatio: number = 0.25;
  spriteCycleSpeed: number = 100;

  private readonly sprites: number[];
  private readonly backgroundColors: Color[];
  private readonly foregroundColors: Color[];
  private readonly cycles: number;
  private spriteIndex: number = 0;
  private spriteCycleAcc: number = 0;

  constructor(actor: Actor, spriteWidth: number, spriteHeight: number, sprites: number[], backgroundColors: Color[], foregroundColors: Color[]) {
    this.actor = actor;
    this.absoluteX = actor.x * spriteWidth;
    this.absoluteY = actor.y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprites = sprites;
    this.backgroundColors = backgroundColors;
    this.foregroundColors = foregroundColors;
    this.cycles = Math.max(sprites.length, backgroundColors.length, foregroundColors.length);
  }

  get sprite(): number {
    return this.sprites[this.spriteIndex % this.sprites.length];
  }

  get backgroundColor(): Color {
    return this.backgroundColors[this.spriteIndex % this.backgroundColors.length];
  }

  get foregroundColor(): Color {
    return this.foregroundColors[this.spriteIndex % this.foregroundColors.length];
  }

  isMoving(): boolean {
    return this.moving;
  }

  move(x: number, y: number): void {
    this.moving = true;
    this.goalX = x * this.spriteWidth;
    this.goalY = y * this.spriteHeight;
  }

  bump(x: number, y: number): void {
    this.moving = true;
    this.bumping = true;
    const dx = x - this.actor.x;
    const dy = y - this.actor.y;
    this.goalX = this.absoluteX + dx * this.spriteWidth * this.bumpRatio;
    this.goalY = this.absoluteY + dy * this.spriteHeight * this.bumpRatio;
  }

  animate(action: Action): void {
    if (action instanceof BumpAction)
      this.bump(action.x, action.y);
    else if (action instanceof StepAction)
      this.move(action.x, action.y);
  }

  updateAnimation(delta: number): void {
    // animate sprite/color
    this.spriteCycleAcc += delta;
    while (this.spriteCycleAcc >= this.spriteCycleSpeed) {
      this.spriteCycleAcc -= this.spriteCycleSpeed;
      this.spriteIndex++;
      if (this.spriteIndex >= this.cycles)
        this.spriteIndex = 0;
    }

    if (!this.moving) return;

    // animate movement
    let gx = this.goalX;
    let gy = this.goalY;
    let ax = this.absoluteX;
    let ay = this.absoluteY;

    if (gx == ax && gy == ay) {
      if (this.bumping) {
        this.bumping = false;
        gx = this.actor.x * this.spriteWidth;
        gy = this.actor.y * this.spriteHeight;
      } else {
        this.moving = false;
        return;
      }
    }

    let change = delta * this.animationSpeed;
    if ((ax < gx || ax > gx) && (ay < gy || ay > gy))
      change *= Math.SQRT1_2;
    if (ax < gx) {
      ax += change;
      if (ax > gx) ax = gx;
    } else if (ax > gx) {
      ax -= change;
      if (ax < gx) ax = gx;
    }
    if (ay < gy) {
      ay += change;
      if (ay > gy) ay = gy;
    } else if (ay > gy) {
      ay -= change;
      if (ay < gy) ay = gy;
    }

    this.goalX = gx;
    this.goalY = gy;
    this.absoluteX = ax;
    this.absoluteY = ay;
  }
}

export default AnimationInfo;