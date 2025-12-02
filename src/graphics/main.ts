import PrimaryAction from "../world/actions/primaryaction";
import SecondaryAction from "../world/actions/secondaryaction";
import Game from "../logic/game";
import Map from "../world/map";
import Pos from "../world/pos";
import Tile from "../world/tile";
import World from "../world/world";
import GraphicsActor from "./graphicsactor";
import Color from "./color";
import Sprites from "./sprites";
import graphicsTiles from "./tiles/graphicstiles";
import Entity from "../world/actors/actor";
import Action from "../world/actions/action";

class Main {
  private readonly width: number = 20;
  private readonly height: number = 20;
  private readonly spriteWidth: number = 32;
  private readonly spriteHeight: number = 32;

  private readonly game: Game = new Game(this.width, this.height);
  private readonly world: World = this.game.world;
  private readonly map: Map = this.world.map;

  private actors: GraphicsActor[] = this.world.actors.map(e => this.createGraphicsActor(e));

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

  private waitingOnAnimations: boolean = false;
  private pendingAnimations: { actor: GraphicsActor, action: Action }[] = [];

  private createGraphicsActor(entity: Entity): GraphicsActor {
    if (entity.isPlayer())
      return new GraphicsActor(entity, this.spriteWidth, this.spriteHeight, [1], [Color.Black]);
    return new GraphicsActor(entity, this.spriteWidth, this.spriteHeight, [1], [Color.Red]);
  }

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
      this.world.player.setAction(new SecondaryAction(new Pos(mx, my)));
    } else if (event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.world.player.setAction(new PrimaryAction(new Pos(mx, my)));
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

  private startPendingAnimations(): void {
    const pendingAnimations = this.pendingAnimations;
    const nextPendingAnimations: { actor: GraphicsActor, action: Action }[] = [];
    for (let i = 0; i < pendingAnimations.length; i++) {
      const animation = pendingAnimations[i];
      if (animation.actor.isMoving())
        nextPendingAnimations.push(animation);
      else
        animation.actor.animate(animation.action);
    }
    this.pendingAnimations = nextPendingAnimations;
  }

  private logic(delta: number): void {
    // take a turn
    if (this.waitingOnAnimations) {
      this.startPendingAnimations();
      let allDone = true;
      for (let i = 0; i < this.actors.length; i++) {
        if (this.actors[i].isMoving()) {
          allDone = false;
          break;
        }
      }
      if (this.pendingAnimations.length == 0 && allDone)
        this.waitingOnAnimations = false;
    } else {
      const result = this.game.takeTurn();
      if (result) {
        const { action, actorIndex } = result;
        const actor = this.actors[actorIndex];
        this.pendingAnimations.push({ actor, action });
        if (actor.isPlayer()) this.waitingOnAnimations = true;
      }
    }

    // update tile animations
    this.tileCycleAcc += delta;
    while (this.tileCycleAcc >= this.tileCycleSpeed) {
      this.tileCycleAcc -= this.tileCycleSpeed;
      this.tileCycleIndex++;
      if (this.tileCycleIndex >= this.tileCycleMax)
        this.tileCycleIndex = 0;
    }

    // update actor animations
    const actors = this.actors;
    for (let i = 0; i < actors.length; i++)
      actors[i].updateAnimation(delta);
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
    const map = this.map;
    const world = this.world;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
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
          sprite = graphicstile.sprite(world, index);
          background = graphicstile.color(world, index, true);
          foreground = graphicstile.color(world, index, false);
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

    // draw actors
    const actors = this.actors;
    for (let i = 0; i < actors.length; i++) {
      const actor = actors[i];
      if (actor.isPlayer() || this.map.isVisible(actor.x, actor.y))
        this.drawEntity(actor);
    }

    // draw goal
    if (!this.world.player.isIdle())
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

    // draw position
    const posText = `pos: ${this.mx}, ${this.my}`;
    this.ctx!.font = "12px monospace"
    this.ctx!.fillStyle = "white";
    this.ctx!.fillRect(this.width * this.spriteWidth - 200, 0, 100, 16);
    this.ctx!.fillStyle = "black";
    this.ctx!.fillText(posText, this.width * this.spriteWidth - 200 + 5, 10);

    // draw turns
    const turnsText = `turns: ${this.game.turns} | ${this.game.playerTurns}`;
    this.ctx!.font = "12px monospace"
    this.ctx!.fillStyle = "white";
    this.ctx!.fillRect(this.width * this.spriteWidth - 300, 0, 100, 16);
    this.ctx!.fillStyle = "black";
    this.ctx!.fillText(turnsText, this.width * this.spriteWidth - 300 + 5, 10);

    // debug
    const debugText = `debug: ${this.pendingAnimations.length}`;
    this.ctx!.font = "12px monospace"
    this.ctx!.fillStyle = "white";
    this.ctx!.fillRect(this.width * this.spriteWidth - 400, 0, 100, 16);
    this.ctx!.fillStyle = "black";
    this.ctx!.fillText(debugText, this.width * this.spriteWidth - 400 + 5, 10);

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

  private drawEntity(entity: GraphicsActor): void {
    this.drawSpriteAbsolute(entity.sprite, entity.absoluteX, entity.absoluteY, entity.color, Color.Transparent);
  }
}

export default Main;