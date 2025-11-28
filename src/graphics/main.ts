import Action from "../logic/actions/action";
import BumpAction from "../logic/actions/bumpaction";
import CloseDoorAction from "../logic/actions/closedooraction";
import MoveAction from "../logic/actions/moveaction";
import OpenDoorAction from "../logic/actions/opendooraction";
import Game from "../logic/game";
import Map from "../logic/map";
import PathFinding from "../logic/pathfinding";
import ShadowCasting from "../logic/shadowcasting";
import Tile from "../logic/tile";
import World from "../logic/world";
import AnimatedEntity from "./animatedentity";
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

  private readonly game: Game = new Game(this.width, this.height);
  private readonly world: World = this.game.world;
  private readonly map: Map = this.world.map;

  private player: AnimatedEntity = new AnimatedEntity(this.world.player, this.spriteWidth, this.spriteHeight, true);
  private gx: number = 0;
  private gy: number = 0;
  private actionStack: Action[] | null = null;

  private monster: AnimatedEntity = new AnimatedEntity(this.world.npc, this.spriteWidth, this.spriteHeight);
  private monsterActionStack: Action[] | null = null;

  private mx: number = 0;
  private my: number = 0;

  private ctx: CanvasRenderingContext2D;
  private readonly sprites: Sprites = new Sprites(this.originalSpriteWidth, this.originalSpriteHeight);

  async initialize(canvasId: string, spriteSheetUrl: string, spriteSheetWidth: number, spriteSheetHeight: number): Promise<void> {
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
      // alternative action
      const tile = this.map.get(mx, my);
      if (tile == Tile.OpenDoor) {
        const path = this.game.findPath(this.player.x, this.player.y, mx, my);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new MoveAction(p));
          actions.push(new CloseDoorAction(last));
          actions.reverse();
          this.actionStack = actions;
        }
      } else if (tile == Tile.ClosedDoor) {
        this.map.set(mx, my, Tile.OpenDoor);
        const path = this.game.findPath(this.player.x, this.player.y, mx, my);
        this.map.set(mx, my, Tile.ClosedDoor);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new MoveAction(p));
          actions.push(new OpenDoorAction(last));
          actions.reverse();
          this.actionStack = actions;
        }
      }
    } else if (event.buttons == 1) {
      // main action
      const tile = this.map.get(mx, my);
      if (tile == Tile.ClosedDoor) {
        this.map.set(mx, my, Tile.OpenDoor);
        const path = this.game.findPath(this.player.x, this.player.y, mx, my);
        this.map.set(mx, my, Tile.ClosedDoor);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new MoveAction(p));
          actions.push(new OpenDoorAction(last));
          actions.push(new MoveAction(last));
          actions.reverse();
          this.actionStack = actions;
        }
      } else if (tile == Tile.Wall) {
        this.map.set(mx, my, Tile.Empty);
        const path = this.game.findPath(this.player.x, this.player.y, mx, my);
        this.map.set(mx, my, Tile.Wall);
        if (path && path.length > 0) {
          this.gx = this.mx;
          this.gy = this.my;
          const last = path.pop()!;
          const actions = path.map(p => new MoveAction(p));
          actions.push(new BumpAction(last));
          actions.reverse();
          this.actionStack = actions;
        }
      } else {
        const path = this.game.findPath(this.player.x, this.player.y, mx, my);
        if (path) {
          this.gx = this.mx;
          this.gy = this.my;
          const actions = path.map(p => new MoveAction(p));
          actions.reverse();
          this.actionStack = actions;
        }
      }
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

    this.logic(delta);

    this.draw();

    requestAnimationFrame(time => this.loop(time));
  }

  private logic(delta: number): void {
    // perform player actions
    if (!this.player.isAnimating()) {
      const actionStack = this.actionStack;
      if (actionStack) {
        if (actionStack.length > 0) {
          const nextAction = actionStack.pop()!;
          nextAction.perform(this.game, this.player);
        } else this.actionStack = null;
      }
    }

    // perform and plan monster actions
    if (!this.monster.isAnimating()) {
      const actionStack = this.monsterActionStack;
      if (actionStack) {
        if (actionStack.length > 0) {
          const nextAction = actionStack.pop()!;
          nextAction.perform(this.game, this.monster);
        } else this.monsterActionStack = null;
      } else {
        const x = Math.floor(Math.random() * this.width);
        const y = Math.floor(Math.random() * this.height);
        const tile = this.map.get(x, y);
        if (tile == Tile.Empty) {
          const path = this.game.findPath(this.monster.x, this.monster.y, x, y);
          if (path) {
            const actions = path.map(p => new MoveAction(p));
            actions.reverse();
            this.monsterActionStack = actions;
          }
        } else if (tile == Tile.Wall) {
          this.map.set(x, y, Tile.Empty);
          const path = this.game.findPath(this.monster.x, this.monster.y, x, y);
          this.map.set(x, y, Tile.Wall);
          if (path && path.length > 0) {
            const last = path.pop()!;
            const actions = path.map(p => new MoveAction(p));
            actions.push(new BumpAction(last));
            actions.reverse();
            this.monsterActionStack = actions;
          }
        } else if (tile == Tile.ClosedDoor) {
          this.map.set(x, y, Tile.Empty);
          const path = this.game.findPath(this.monster.x, this.monster.y, x, y);
          this.map.set(x, y, Tile.Wall);
          if (path && path.length > 0) {
            const last = path.pop()!;
            const actions = path.map(p => new MoveAction(p));
            actions.push(new OpenDoorAction(last));
            actions.push(new MoveAction(last));
            actions.reverse();
            this.monsterActionStack = actions;
          }
        } else if (tile == Tile.OpenDoor) {
          const path = this.game.findPath(this.monster.x, this.monster.y, x, y);
          if (path && path.length > 0) {
            const last = path.pop()!;
            const actions = path.map(p => new MoveAction(p));
            actions.push(new CloseDoorAction(last));
            actions.reverse();
            this.monsterActionStack = actions;
          }
        }
      }
    }

    // update animations
    this.monster.update(delta);
    this.player.update(delta);
  }

  private draw(): void {
    // draw map
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.drawTile(x, y);
      }
    }

    // draw monster
    if (this.map.isVisible(this.monster.x, this.monster.y))
      this.drawSpriteAbsolute(0, this.monster.absoluteX, this.monster.absoluteY, Color.Red, Color.Transparent);

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
