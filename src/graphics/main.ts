import Map from "../logic/map";
import PathFinding from "../logic/pathfinding";
import Pos from "../logic/pos";
import ShadowCasting from "../logic/shadowcasting";
import Tile from "../logic/tile";
import AnimatedEntity from "./animatedentity";
import Color from "./color";
import Sprites from "./sprites";

interface Action { }

class Move implements Action {
  readonly position: Pos;

  constructor(position: Pos) {
    this.position = position;
  }
}

class OpenDoor implements Action {
  readonly position: Pos;

  constructor(position: Pos) {
    this.position = position;
  }
}

class CloseDoor implements Action {
  readonly position: Pos;

  constructor(position: Pos) {
    this.position = position;
  }
}

class Main {
  private running: boolean = false;
  private lastTime: DOMHighResTimeStamp;

  private readonly width: number = 20;
  private readonly height: number = 20;
  private readonly originalSpriteWidth: number = 16;
  private readonly originalSpriteHeight: number = 16;
  private readonly spriteWidth: number = 32;
  private readonly spriteHeight: number = 32;

  private readonly map: Map = new Map(this.width, this.height);
  private readonly pathfinding: PathFinding = new PathFinding(this.map);
  private readonly shadowcasting: ShadowCasting = new ShadowCasting(this.map);

  private player: AnimatedEntity = new AnimatedEntity(1, 1, this.spriteWidth, this.spriteHeight);
  private gx: number = 0;
  private gy: number = 0;
  private actionStack: Action[] | null = null;

  private mx: number = 0;
  private my: number = 0;

  private ctx: CanvasRenderingContext2D;
  private readonly sprites: Sprites = new Sprites(this.originalSpriteWidth, this.originalSpriteHeight);
  private readonly animationSpeed: number = 0.25;

  constructor() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1)
          this.map.set(x, y, Tile.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, Tile.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, Tile.Empty);
        if (x == 8 && y == 6)
          this.map.set(x, y, Tile.ClosedDoor);
      }
    }
  }

  async initialize(canvasId: string, spriteSheetUrl: string, spriteSheetWidth: number, spriteSheetHeight: number): Promise<void> {
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);

    const canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    canvas.addEventListener("mousemove", event => this.handleMouseMove(event));
    canvas.addEventListener("mousedown", event => this.handleMouseDown(event));
  }

  refreshVisibility() {
    this.shadowcasting.refreshVisibility(this.player.x, this.player.y);
  }

  start(): void {
    this.running = true;
    requestAnimationFrame(time => {
      this.lastTime = time;
      this.initLoop();
      requestAnimationFrame(time => this.loop(time));
    });
  }

  stop(): void {
    this.running = false;
  }

  private handleMouseMove(event: MouseEvent): void {
    const mx = Math.floor(event.offsetX / this.spriteWidth);
    const my = Math.floor(event.offsetY / this.spriteHeight);
    this.mx = mx < 0 ? 0 : mx >= this.width ? this.width - 1 : mx;
    this.my = my < 0 ? 0 : my >= this.height ? this.height - 1 : my;
  }

  private handleMouseDown(event: MouseEvent): void {
    const mx = this.mx;
    const my = this.my;
    if (event.buttons == 4 || (event.ctrlKey && event.buttons == 1)) {
      // alternative action
      const tile = this.map.get(mx, my);
      if (tile == Tile.OpenDoor) {
        const path = this.pathfinding.findPath(this.player.x, this.player.y, mx, my);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new Move(p));
          actions.push(new CloseDoor(last));
          actions.reverse();
          this.actionStack = actions;
        }
      } else if (tile == Tile.ClosedDoor) {
        this.map.set(mx, my, Tile.OpenDoor);
        const path = this.pathfinding.findPath(this.player.x, this.player.y, mx, my);
        this.map.set(mx, my, Tile.ClosedDoor);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new Move(p));
          actions.push(new OpenDoor(last));
          actions.reverse();
          this.actionStack = actions;
        }
      }
    } else if (event.buttons == 1) {
      // main action
      const tile = this.map.get(mx, my);
      if (tile == Tile.ClosedDoor) {
        this.map.set(mx, my, Tile.OpenDoor);
        const path = this.pathfinding.findPath(this.player.x, this.player.y, mx, my);
        this.map.set(mx, my, Tile.ClosedDoor);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new Move(p));
          actions.push(new OpenDoor(last));
          actions.push(new Move(last));
          actions.reverse();
          this.actionStack = actions;
        }
      } else {
        const path = this.pathfinding.findPath(this.player.x, this.player.y, mx, my);
        if (path) {
          this.gx = this.mx;
          this.gy = this.my;
          const actions = path.map(p => new Move(p));
          actions.reverse();
          this.actionStack = actions;
        }
      }
    }
  }

  private initLoop(): void {
    this.refreshVisibility();
    this.draw();
  }

  private loop(time: DOMHighResTimeStamp): void {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;

    this.logic(delta);

    this.draw();

    requestAnimationFrame(time => this.loop(time));
  }

  private logic(delta: number): void {
    let shouldRefreshVisiblity = false;

    const actionStack = this.actionStack;
    if (actionStack) {
      if (actionStack.length > 0) {
        if (!this.player.isAnimating()) {
          const nextAction = actionStack.pop()!;
          if (nextAction instanceof Move) {
            const pos = nextAction.position;
            this.player.offsetTowards(pos.x, pos.y);
          } else if (nextAction instanceof OpenDoor) {
            const pos = nextAction.position;
            this.map.set(pos.x, pos.y, Tile.OpenDoor);
            shouldRefreshVisiblity = true;
          } else if (nextAction instanceof CloseDoor) {
            const pos = nextAction.position;
            this.map.set(pos.x, pos.y, Tile.ClosedDoor);
            shouldRefreshVisiblity = true;
          }
        }
      } else this.actionStack = null;
    }

    // update player animation
    shouldRefreshVisiblity = shouldRefreshVisiblity || this.player.update(delta);

    if (shouldRefreshVisiblity)
      this.refreshVisibility();
  }

  private draw(): void {
    // draw map
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.drawTile(x, y);
      }
    }

    // draw player
    this.drawSpriteAbsolute(0, this.player.absoluteX, this.player.absoluteY, Color.Black, Color.Transparent);

    // draw goal
    if (this.actionStack)
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");

    // draw mouse indicator
    this.drawRect(this.mx, this.my, "rgba(0, 160, 0, 0.5)");

    // draw description text
    const tileText = Tile.description(this.map.get(this.mx, this.my));
    if (tileText) {
      this.ctx.font = "12px monospace";
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, tileText.length * 8, 16);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(tileText, 5, 10);
    }
  }

  private drawTile(x: number, y: number): void {
    const map = this.map;
    const visible = map.isVisible(x, y);
    const tile = map.get(x, y);
    if (visible) {
      if (tile == Tile.Wall)
        this.drawSprite(1, x, y, Color.Black);
      else if (tile == Tile.ClosedDoor)
        this.drawSprite(2, x, y, Color.Black);
      else if (tile == Tile.OpenDoor)
        this.drawSprite(3, x, y, Color.Black);
      else
        this.drawRect(x, y, "white");
    } else {
      if (map.isExplored(x, y)) {
        if (tile == Tile.Wall)
          this.drawSprite(1, x, y, Color.Grey);
        else if (tile == Tile.ClosedDoor)
          this.drawSprite(2, x, y, Color.Grey);
        else if (tile == Tile.OpenDoor)
          this.drawSprite(3, x, y, Color.Grey);
        else
          this.drawRect(x, y, "grey");
      } else {
        this.drawRect(x, y, "black");
      }
    }
  }

  private drawRect(x: number, y: number, style: string) {
    this.ctx.fillStyle = style;
    this.ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }

  private drawSpriteAbsolute(index: number, x: number, y: number, foreground: Color, background: Color = Color.White) {
    const image = this.sprites.get(index, background, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }

  private drawSprite(index: number, x: number, y: number, foreground: Color) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground);
  }
}

export default Main;
