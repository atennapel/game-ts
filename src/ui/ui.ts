import Game from "../game/game";
import Entity from "../game/world/entities/entity";
import Table from "../game/world/entities/table";
import Map from "../game/world/map";
import Tile from "../game/world/tile";
import World from "../game/world/world";
import Color from "./color";
import Sprites from "./sprites";

class UI {
  private readonly width: number = 20;
  private readonly height: number = 20;
  private readonly spriteWidth: number = 32;
  private readonly spriteHeight: number = 32;
  private readonly spriteWidthHalf: number = this.spriteWidth / 2;
  private readonly spriteHeightHalf: number = this.spriteHeight / 2;

  private ctx: CanvasRenderingContext2D | null = null;
  private sprites: Sprites | null = null;

  private running: boolean = false;
  private lastTime: DOMHighResTimeStamp = 0;
  private fps: number = 0;

  private tileCycleIndex: number = 0;
  private tileCycleAcc: number = 0;
  private tileCycleSpeed: number = 64;
  private tileCycleMax: number = 60;

  private mx: number = 0;
  private my: number = 0;

  readonly game: Game = new Game(this.width, this.height);
  private readonly world: World = this.game.world;
  private readonly map: Map = this.world.map;

  async initialize(
    canvasId: string,
    spriteSheetUrl: string,
    spriteSheetWidth: number,
    spriteSheetHeight: number,
    originalSpriteWidth: number,
    originalSpriteHeight: number): Promise<void> {
    this.sprites = new Sprites(originalSpriteWidth, originalSpriteHeight);
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);

    const canvas = <HTMLCanvasElement>document.getElementById(canvasId);
    const ctx = canvas.getContext("2d")!;
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;

    canvas.addEventListener("mousemove", event => this.handleMouseMove(event));
    canvas.addEventListener("mousedown", event => this.handleMouseDown(event));
  }

  start(): void {
    this.running = true;
    requestAnimationFrame(time => {
      this.lastTime = time;
      this.init();
      requestAnimationFrame(time => this.loop(time));
    });
  }

  stop(): void {
    this.running = false;
  }

  private init(): void {
    this.game.refreshVisibility(1, 1);
  }

  private loop(time: DOMHighResTimeStamp): void {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.fps = 1000 / delta;

    this.update(delta);
    this.draw();

    requestAnimationFrame(time => this.loop(time));
  }

  // input
  private handleMouseMove(event: MouseEvent): void {
    const mx = Math.floor(event.offsetX / this.spriteWidth);
    const my = Math.floor(event.offsetY / this.spriteHeight);
    this.mx = mx < 0 ? 0 : mx >= this.width ? this.width - 1 : mx;
    this.my = my < 0 ? 0 : my >= this.height ? this.height - 1 : my;
  }

  private handleMouseDown(event: MouseEvent): void {
    const mx = this.mx;
    const my = this.my;
    this.game.refreshVisibility(mx, my);
  }

  // logic
  private update(delta: number): void {
    // update tile animations
    this.tileCycleAcc += delta;
    while (this.tileCycleAcc >= this.tileCycleSpeed) {
      this.tileCycleAcc -= this.tileCycleSpeed;
      this.tileCycleIndex++;
      if (this.tileCycleIndex >= this.tileCycleMax)
        this.tileCycleIndex = 0;
    }
  }

  // drawing
  private draw(): void {
    const ctx = this.ctx!;
    const mx = this.mx;
    const my = this.my;
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const map = this.map;

    // clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * spriteWidth, this.height * spriteHeight);

    // draw map
    const tileSpriteCache: number[] = [];
    const tileBackgroundCache: Color[] = [];
    const tileForegroundCache: Color[] = [];
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const visible = map.isVisible(x, y);
        const tile = map.get(x, y);
        let sprite;
        let foreground;
        let background = tileBackgroundCache[tile];
        if (background) {
          sprite = tileSpriteCache[tile];
          foreground = tileForegroundCache[tile];
        } else {
          const info = this.getTileDrawingInfo(tile);
          sprite = info.sprite;
          background = info.background;
          foreground = info.foreground;
          tileSpriteCache[tile] = sprite;
          tileBackgroundCache[tile] = background;
          tileForegroundCache[tile] = foreground;
        }
        if (visible) {
          this.drawSprite(sprite, x, y, background, foreground);
        } else if (map.isExplored(x, y)) {
          this.drawSprite(sprite, x, y, background, foreground);
          this.drawRect(x, y, Color.NotVisible);
        } else {
          this.drawRect(x, y, Color.Black);
        }
      }
    }

    // draw entities
    for (let entity of this.world.entities) {
      if (map.isVisible(entity.x, entity.y))
        this.drawEntity(entity);
    }

    // draw mouse indicator
    this.drawRect(mx, my, Color.MouseIndicator);

    // draw description text
    if (map.isExplored(mx, my)) {
      let tileText: string | null = null;
      if (map.isVisible(mx, my)) {
        const tileEntity = this.world.entityAt(mx, my);
        if (tileEntity) tileText = tileEntity.description();
        else tileText = Tile.description(map.get(mx, my));
      } else tileText = Tile.description(map.get(mx, my));
      if (tileText) {
        ctx.font = "12px monospace";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tileText.length * 8 + 5, 16);
        ctx.fillStyle = "black";
        ctx.fillText(tileText, 5, 10);
      }
    }

    // draw fps
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    ctx.font = "12px monospace"
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * spriteWidth - 100, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(fpsText, this.width * spriteWidth - 100 + 5, 10);

    // draw position
    const posText = `pos: ${mx}, ${my}`;
    ctx.font = "12px monospace"
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * spriteWidth - 200, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(posText, this.width * spriteWidth - 200 + 5, 10);
  }

  private getTileDrawingInfo(tile: Tile): { sprite: number, background: Color, foreground: Color } {
    switch (tile) {
      case Tile.Empty: return { sprite: 0, background: Color.Transparent, foreground: Color.Transparent };
      case Tile.Wall: return { sprite: 2, background: Color.White, foreground: Color.Black };
      case Tile.Fire: return this.animatedTile([5, 6], [Color.Transparent], [Color.Red, Color.Red155], 2, 2);
    }
  }

  private animatedTile(
    sprites: number[],
    backgroundColors: Color[],
    foregroundColors: Color[],
    spriteAnimationSpeed: number,
    colorAnimationSpeed: number): { sprite: number, background: Color, foreground: Color } {
    const index = this.tileCycleIndex;
    const sprite = sprites[Math.floor(index / spriteAnimationSpeed) % sprites.length];
    const i = Math.floor(index / colorAnimationSpeed);
    const background = backgroundColors[i % backgroundColors.length];
    const foreground = foregroundColors[i % foregroundColors.length];
    return { sprite, background, foreground };
  }

  private drawEntity(entity: Entity): void {
    if (entity instanceof Table)
      this.drawSprite(8, entity.x, entity.y, Color.DarkBrown, Color.Brown);
  }

  // drawing helpers
  private drawSpriteAbsolute(index: number, x: number, y: number, background: Color, foreground: Color): void {
    const image = this.sprites!.get(index, background, foreground);
    if (image) this.ctx!.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }

  private drawSprite(index: number, x: number, y: number, background: Color, foreground: Color): void {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, background, foreground);
  }

  private drawRect(x: number, y: number, color: Color): void {
    const ctx = this.ctx!;
    ctx.fillStyle = color.toCSS();
    ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }

  private drawLine(x: number, y: number, tx: number, ty: number, lineWidth: number, color: Color): void {
    const ctx = this.ctx!;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const w = this.spriteWidth;
    const wh = this.spriteWidthHalf;
    const h = this.spriteHeight;
    const hh = this.spriteHeightHalf;
    ctx.moveTo(x * w + wh, y * h + hh);
    ctx.lineTo(tx * w + wh, ty * h + hh);
    ctx.strokeStyle = color.toCSS();
    ctx.stroke();
  }
}

export default UI;