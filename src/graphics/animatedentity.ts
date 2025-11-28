import { approxEquals } from "../util";

class AnimatedEntity {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  private goalX: number;
  private goalY: number;
  private spriteWidth: number;
  private spriteHeight: number;
  private animating: boolean = false;
  private bumping: boolean = false;
  animationSpeed: number = 0.25;

  constructor(x: number, y: number, spriteWidth: number, spriteHeight: number) {
    this.x = x;
    this.y = y;
    this.absoluteX = x * spriteWidth;
    this.absoluteY = y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  isAnimating(): boolean {
    return this.animating;
  }

  move(x: number, y: number): void {
    this.animating = true;
    this.goalX = x * this.spriteWidth;
    this.goalY = y * this.spriteHeight;
  }

  bump(x: number, y: number, ratio: number): void {
    this.animating = true;
    this.bumping = true;
    const dx = x - this.x;
    const dy = y - this.y;
    this.goalX = this.absoluteX + dx * this.spriteWidth * ratio;
    this.goalY = this.absoluteY + dy * this.spriteHeight * ratio;
  }

  // returns true if visiblity should be refreshed
  update(delta: number): boolean {
    if (!this.animating) return false;

    let gx = this.goalX;
    let gy = this.goalY;
    let ax = this.absoluteX;
    let ay = this.absoluteY;

    if (gx == ax && gy == ay) {
      if (this.bumping) {
        this.bumping = false;
        gx = this.x * this.spriteWidth;
        gy = this.y * this.spriteHeight;
      } else {
        this.animating = false;
        this.x = Math.floor(gx / this.spriteWidth);
        this.y = Math.floor(gy / this.spriteHeight);
        return true;
      }
    }

    const change = delta * this.animationSpeed;
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

    return false;
  }
}

export default AnimatedEntity;
