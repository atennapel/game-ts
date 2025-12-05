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

  private mx: number = 0;
  private my: number = 0;

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
      requestAnimationFrame(time => this.loop(time));
    });
  }

  stop(): void {
    this.running = false;
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
  }

  // logic
  private update(delta: number): void {
  }

  // drawing
  private draw(): void {
    const ctx = this.ctx!;
    const mx = this.mx;
    const my = this.my;

    // clear canvas
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * this.spriteWidth, this.height * this.spriteHeight);

    // draw mouse indicator
    this.drawRect(mx, my, new Color(0, 160, 0, 0.5));

    // draw fps
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    ctx.font = "12px monospace"
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 100, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(fpsText, this.width * this.spriteWidth - 100 + 5, 10);

    // draw position
    const posText = `pos: ${this.mx}, ${this.my}`;
    ctx.font = "12px monospace"
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 200, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(posText, this.width * this.spriteWidth - 200 + 5, 10);
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