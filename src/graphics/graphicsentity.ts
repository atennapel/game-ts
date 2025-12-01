import Action from "../logic/actions/action";
import Actor from "../logic/actor";
import Entity from "../logic/entities/entity";
import Game from "../logic/game";
import Color from "./color";

class GraphicsEntity implements Actor {
  private entity: Entity;

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
  private readonly colors: Color[];
  private readonly cycles: number;
  private spriteIndex: number = 0;
  private spriteCycleAcc: number = 0;

  constructor(entity: Entity, spriteWidth: number, spriteHeight: number, sprites: number[], colors: Color[]) {
    this.entity = entity;
    this.absoluteX = entity.x * spriteWidth;
    this.absoluteY = entity.y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprites = sprites;
    this.colors = colors;
    this.cycles = Math.max(sprites.length, colors.length);
  }

  get x(): number { return this.entity.x }
  get y(): number { return this.entity.y }

  get sprite(): number {
    return this.sprites[this.spriteIndex % this.sprites.length];
  }

  get color(): Color {
    return this.colors[this.spriteIndex % this.colors.length];
  }

  isPlayer(): boolean {
    return this.entity.isPlayer();
  }

  move(x: number, y: number): void {
    this.moving = true;
    this.goalX = x * this.spriteWidth;
    this.goalY = y * this.spriteHeight;
  }

  bump(x: number, y: number): void {
    this.moving = true;
    this.bumping = true;
    const dx = x - this.entity.x;
    const dy = y - this.entity.y;
    this.goalX = this.absoluteX + dx * this.spriteWidth * this.bumpRatio;
    this.goalY = this.absoluteY + dy * this.spriteHeight * this.bumpRatio;
  }

  update(game: Game, delta: number): void {
    // animate sprite/color
    this.spriteCycleAcc += delta;
    while (this.spriteCycleAcc >= this.spriteCycleSpeed) {
      this.spriteCycleAcc -= this.spriteCycleSpeed;
      this.spriteIndex++;
      if (this.spriteIndex >= this.cycles)
        this.spriteIndex = 0;
    }

    // let entity take turn if possible
    if (!this.moving && !this.entity.takeTurn(game, this)) return;

    // animate movement
    let gx = this.goalX;
    let gy = this.goalY;
    let ax = this.absoluteX;
    let ay = this.absoluteY;

    if (gx == ax && gy == ay) {
      if (this.bumping) {
        this.bumping = false;
        gx = this.entity.x * this.spriteWidth;
        gy = this.entity.y * this.spriteHeight;
      } else {
        this.moving = false;
        this.entity.move(Math.floor(gx / this.spriteWidth), Math.floor(gy / this.spriteHeight));
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

  resetActions(): void {
    this.entity.resetActions();
  }

  addActions(actions: Action[]): void {
    this.entity.addActions(actions);
  }

  setAction(action: Action): void {
    this.entity.setAction(action);
  }

  isIdle(): boolean {
    return this.entity.isIdle();
  }
}

export default GraphicsEntity;
