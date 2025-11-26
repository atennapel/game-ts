import Map from "../logic/map";
import PathFinding from "../logic/pathfinding";
import Pos from "../logic/pos";
import ShadowCasting from "../logic/shadowcasting";
import Tile from "../logic/tile";
import Color from "./color";
import Sprites from "./sprites";

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

  private x: number = 1;
  private y: number = 1;
  private ax: number = this.spriteWidth;
  private ay: number = this.spriteHeight;
  private ox: number = 0;
  private oy: number = 0;
  private gx: number = 0;
  private gy: number = 0;
  private revPath: Pos[] | null = null;

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
          this.map.set(x, y, Tile.Empty);
      }
    }
  }

  async initialize(canvasId: string, spriteSheetUrl: string, spriteSheetWidth: number, spriteSheetHeight: number): Promise<void> {
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);

    const canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    window.addEventListener("mousemove", event => this.handleMouseMove(event));
    window.addEventListener("mousedown", event => this.handleMouseDown(event));
  }

  start(): void {
    this.running = true;
    requestAnimationFrame(time => {
      this.lastTime = time;
      this.shadowcasting.refreshVisibility(this.x, this.y);
      requestAnimationFrame(time => this.loop(time));
    });
  }

  stop(): void {
    this.running = false;
  }

  private handleMouseMove(event: MouseEvent): void {
    this.mx = Math.floor(event.offsetX / this.spriteWidth);
    this.my = Math.floor(event.offsetY / this.spriteHeight);
  }

  private handleMouseDown(event: MouseEvent): void {
    if (event.buttons == 1) {
      const path = this.pathfinding.findPath(this.x, this.y, this.mx, this.my);
      if (path) {
        this.gx = this.mx;
        this.gy = this.my;
        path.reverse();
        this.revPath = path;
      }
    }
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
    let x = this.x;
    let y = this.y;
    let ox = this.ox;
    let oy = this.oy;

    const path = this.revPath;
    if (path) {
      if (path.length > 0) {
        if (ox == 0 && oy == 0) {
          const nextPos = path.pop()!;
          if (nextPos.x > x) ox = this.spriteWidth;
          else if (nextPos.x < x) ox = -this.spriteWidth;
          if (nextPos.y > y) oy = this.spriteHeight;
          else if (nextPos.y < y) oy = -this.spriteHeight;
        }
      } else this.revPath = null;
    }

    if (ox > 0) {
      const dist = delta * this.animationSpeed;
      this.ax += dist;
      ox -= dist;
      if (ox < 0.1) {
        ox = 0;
        x += 1;
        this.ax = x * this.spriteWidth;
        this.shadowcasting.refreshVisibility(x, y);
      }
    } else if (ox < 0) {
      const dist = delta * this.animationSpeed;
      this.ax -= dist;
      ox += dist;
      if (ox > -0.1) {
        ox = 0;
        x -= 1;
        this.ax = x * this.spriteWidth;
        this.shadowcasting.refreshVisibility(x, y);
      }
    }
    if (oy > 0) {
      const dist = delta * this.animationSpeed;
      this.ay += dist;
      oy -= dist;
      if (oy < 0.1) {
        oy = 0;
        y += 1;
        this.ay = y * this.spriteHeight;
        this.shadowcasting.refreshVisibility(x, y);
      }
    } else if (oy < 0) {
      const dist = delta * this.animationSpeed;
      this.ay -= dist;
      oy += dist;
      if (oy > -0.1) {
        oy = 0;
        y -= 1;
        this.ay = y * this.spriteHeight;
        this.shadowcasting.refreshVisibility(x, y);
      }
    }

    this.x = x;
    this.y = y;
    this.ox = ox;
    this.oy = oy;
  }

  private draw(): void {
    // draw map
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.drawTile(x, y);
      }
    }

    // draw player
    this.drawSpriteAbsolute(0, this.ax, this.ay, Color.Black);

    // draw goal
    if (this.revPath)
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");

    // draw mouse indicator
    this.drawRect(this.mx, this.my, "rgba(0, 160, 0, 0.5)");

  }

  private drawTile(x: number, y: number): void {
    const map = this.map;
    const visible = map.isVisible(x, y);
    const tile = map.get(x, y);
    if (visible) {
      if (tile == Tile.Empty) {
        this.drawRect(x, y, "white");
      } else {
        this.drawSprite(1, x, y, Color.Black);
      }
    } else {
      if (map.isExplored(x, y)) {
        if (tile == Tile.Wall)
          this.drawSprite(1, x, y, Color.Grey);
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

  private drawSpriteAbsolute(index: number, x: number, y: number, foreground: Color) {
    const image = this.sprites.get(index, Color.White, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }

  private drawSprite(index: number, x: number, y: number, foreground: Color) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground);
  }
}

export default Main;
