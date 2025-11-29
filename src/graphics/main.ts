import PrimaryAction from "../logic/actions/primaryaction";
import SecondaryAction from "../logic/actions/secondaryaction";
import Game from "../logic/game";
import Map from "../logic/map";
import Pos from "../logic/pos";
import Tile from "../logic/tile";
import World from "../logic/world";
import GraphicsEntity from "./graphicsentity";
import Color from "./color";
import Sprites from "./sprites";
import graphicsTiles from "./tiles/graphicstiles";

class Main {
  private readonly width: number = 20;
  private readonly height: number = 20;
  private readonly spriteWidth: number = 32;
  private readonly spriteHeight: number = 32;

  private readonly game: Game = new Game(this.width, this.height);
  private readonly world: World = this.game.world;
  private readonly map: Map = this.world.map;

  private player: GraphicsEntity = new GraphicsEntity(this.world.player, this.spriteWidth, this.spriteHeight, [0], [Color.Black]);
  private monster: GraphicsEntity = new GraphicsEntity(this.world.npc, this.spriteWidth, this.spriteHeight, [0], [Color.Red]);

  private mx: number = 0;
  private my: number = 0;
  private gx: number = 0;
  private gy: number = 0;

  private ctx: CanvasRenderingContext2D | null = null;
  private sprites: Sprites | null = null;

  private running: boolean = false;
  private lastTime: DOMHighResTimeStamp = 0;
  private fps: number = 0;

  private tileCycleIndex: number = 0;
  private tileCycleAcc: number = 0;
  private tileCycleSpeed: number = 64;
  private tileCycleMax: number = 60;

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
    if (!this.map.isExplored(mx, my)) return;
    if (event.buttons == 4 || (event.ctrlKey && event.buttons == 1)) {
      this.gx = mx;
      this.gy = my;
      this.player.setAction(new SecondaryAction(new Pos(mx, my)));
    } else if (event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.player.setAction(new PrimaryAction(new Pos(mx, my)));
    }
  }

  private initLoop(): void {
    this.game.refreshVisibility();
    this.draw();
  }

  private loop(time: DOMHighResTimeStamp): void {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.fps = 1000 / delta;

    this.logic(delta);
    this.draw();

    requestAnimationFrame(time => this.loop(time));
  }

  private logic(delta: number): void {
    // tile animations
    this.tileCycleAcc += delta;
    while (this.tileCycleAcc >= this.tileCycleSpeed) {
      this.tileCycleAcc -= this.tileCycleSpeed;
      this.tileCycleIndex++;
      if (this.tileCycleIndex >= this.tileCycleMax)
        this.tileCycleIndex = 0;
    }

    // entity update
    this.player.update(this.game, delta);
    this.monster.update(this.game, delta);
  }

  private draw(): void {
    // clear canvas
    this.ctx!.fillStyle = "white";
    this.ctx!.fillRect(0, 0, this.width * this.spriteWidth, this.height * this.spriteHeight);

    // draw map
    const tileSpriteCache: number[] = [];
    const tileBackgroundCache: Color[] = [];
    const tileForegroundCache: Color[] = [];
    const index = this.tileCycleIndex;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const map = this.map;
        const visible = map.isVisible(x, y);
        const tile = map.get(x, y);
        let sprite;
        let foreground;
        let background = tileBackgroundCache[tile];
        if (tileBackgroundCache[tile]) {
          sprite = tileSpriteCache[tile];
          foreground = tileForegroundCache[tile];
        } else {
          const graphicstile = graphicsTiles[tile];
          sprite = graphicstile.sprite(index);
          background = graphicstile.color(index, true);
          foreground = graphicstile.color(index, false);
          tileSpriteCache[tile] = sprite;
          tileBackgroundCache[tile] = background;
          tileForegroundCache[tile] = foreground;
        }
        if (visible) {
          this.drawSprite(sprite, x, y, foreground, background);
        } else if (map.isExplored(x, y)) {
          this.drawSprite(sprite, x, y, foreground, background);
          this.drawRect(x, y, "rgba(0, 0, 0, 0.5)");
        } else {
          this.drawRect(x, y, "black");
        }
      }
    }

    // draw entities
    if (this.map.isVisible(this.monster.x, this.monster.y))
      this.drawEntity(this.monster);
    this.drawEntity(this.player);

    // draw goal
    if (!this.player.isIdle())
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");

    // draw mouse indicator
    this.drawRect(this.mx, this.my, "rgba(0, 160, 0, 0.5)");

    // draw description text
    const tileText = Tile.description(this.map.get(this.mx, this.my));
    if (tileText) {
      this.ctx!.font = "12px monospace";
      this.ctx!.fillStyle = "white";
      this.ctx!.fillRect(0, 0, tileText.length * 8 + 5, 16);
      this.ctx!.fillStyle = "black";
      this.ctx!.fillText(tileText, 5, 10);
    }

    // draw fps
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    this.ctx!.font = "12px monospace"
    this.ctx!.fillStyle = "white";
    this.ctx!.fillRect(this.width * this.spriteWidth - 100, 0, 100, 16);
    this.ctx!.fillStyle = "black";
    this.ctx!.fillText(fpsText, this.width * this.spriteWidth - 100 + 5, 10);
  }

  private drawRect(x: number, y: number, style: string): void {
    this.ctx!.fillStyle = style;
    this.ctx!.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }

  private drawSpriteAbsolute(index: number, x: number, y: number, foreground: Color, background: Color = Color.White): void {
    const image = this.sprites!.get(index, background, foreground);
    if (image) this.ctx!.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }

  private drawSprite(index: number, x: number, y: number, foreground: Color, background: Color = Color.White): void {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground, background);
  }

  private drawEntity(entity: GraphicsEntity): void {
    this.drawSpriteAbsolute(entity.sprite, entity.absoluteX, entity.absoluteY, entity.color, Color.Transparent);
  }
}

export default Main;
