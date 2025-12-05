"use strict";

// src/ui/color.ts
var Color = class _Color {
  r;
  g;
  b;
  a;
  constructor(r, g, b, a) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
  equals(other) {
    return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
  }
  toCSS() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
  static Transparent = new _Color(0, 0, 0, 0);
  static White = new _Color(255, 255, 255, 255);
  static Black = new _Color(0, 0, 0, 255);
  static Grey = new _Color(127, 127, 127, 255);
  static DarkGrey = new _Color(100, 100, 100, 255);
  static Red = new _Color(255, 0, 0, 255);
  static Blue = new _Color(0, 255, 0, 255);
  static Green = new _Color(0, 0, 255, 255);
  static Brown = new _Color(150, 75, 0, 255);
  static BrightYellow = new _Color(255, 234, 0, 255);
};
var color_default = Color;

// src/ui/sprites.ts
var Sprites = class _Sprites {
  spriteWidth;
  spriteHeight;
  sprites = [];
  recolors = /* @__PURE__ */ new Map();
  constructor(spriteWidth, spriteHeight) {
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }
  async load(image, width, height) {
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const cols = Math.floor(width / spriteWidth);
    const rows = Math.floor(height / spriteHeight);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const bitmap = await createImageBitmap(image, x * spriteWidth, y * spriteHeight, spriteWidth, spriteHeight);
        this.sprites.push(bitmap);
      }
    }
  }
  async loadFromURL(url, width, height) {
    await fetch(url).then((response) => response.blob()).then((blob) => this.load(blob, width, height));
  }
  get(index, backgroundColor, foregroundColor, transparentColor = color_default.Transparent) {
    const recolors = this.recolors;
    const hash = `${index},${_Sprites.colorHash(backgroundColor)},${_Sprites.colorHash(foregroundColor)}`;
    const recoloredImage = recolors.get(hash);
    if (recoloredImage) return recoloredImage;
    const image = this.sprites[index];
    if (image) {
      const newImage = this.recolor(image, backgroundColor, foregroundColor, transparentColor);
      recolors.set(hash, newImage);
      return newImage;
    }
    return null;
  }
  static colorHash(c) {
    return `${c.r},${c.g},${c.b},${c.a}`;
  }
  recolor(image, backgroundColor, foregroundColor, transparentColor) {
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const canvas = new OffscreenCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, spriteWidth, spriteHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      const a = data[i + 3];
      if (r == 255 && g == 255 && b == 255) {
        data[i] = backgroundColor.r;
        data[i + 1] = backgroundColor.g;
        data[i + 2] = backgroundColor.b;
        data[i + 3] = backgroundColor.a;
      } else if (a == 0) {
        data[i] = transparentColor.r;
        data[i + 1] = transparentColor.g;
        data[i + 2] = transparentColor.b;
        data[i + 3] = transparentColor.a;
      } else {
        data[i] = foregroundColor.r;
        data[i + 1] = foregroundColor.g;
        data[i + 2] = foregroundColor.b;
        data[i + 3] = foregroundColor.a;
      }
    }
    ctx.clearRect(0, 0, 16, 16);
    ctx.putImageData(imageData, 0, 0);
    return canvas.transferToImageBitmap();
  }
};
var sprites_default = Sprites;

// src/ui/ui.ts
var UI = class {
  width = 20;
  height = 20;
  spriteWidth = 32;
  spriteHeight = 32;
  spriteWidthHalf = this.spriteWidth / 2;
  spriteHeightHalf = this.spriteHeight / 2;
  ctx = null;
  sprites = null;
  running = false;
  lastTime = 0;
  fps = 0;
  mx = 0;
  my = 0;
  async initialize(canvasId, spriteSheetUrl, spriteSheetWidth, spriteSheetHeight, originalSpriteWidth, originalSpriteHeight) {
    this.sprites = new sprites_default(originalSpriteWidth, originalSpriteHeight);
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));
    canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
  }
  start() {
    this.running = true;
    requestAnimationFrame((time) => {
      this.lastTime = time;
      requestAnimationFrame((time2) => this.loop(time2));
    });
  }
  stop() {
    this.running = false;
  }
  loop(time) {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.fps = 1e3 / delta;
    this.update(delta);
    this.draw();
    requestAnimationFrame((time2) => this.loop(time2));
  }
  // input
  handleMouseMove(event) {
    const mx = Math.floor(event.offsetX / this.spriteWidth);
    const my = Math.floor(event.offsetY / this.spriteHeight);
    this.mx = mx < 0 ? 0 : mx >= this.width ? this.width - 1 : mx;
    this.my = my < 0 ? 0 : my >= this.height ? this.height - 1 : my;
  }
  handleMouseDown(event) {
    const mx = this.mx;
    const my = this.my;
  }
  // logic
  update(delta) {
  }
  // drawing
  draw() {
    const ctx = this.ctx;
    const mx = this.mx;
    const my = this.my;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * this.spriteWidth, this.height * this.spriteHeight);
    this.drawRect(mx, my, new color_default(0, 160, 0, 0.5));
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 100, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(fpsText, this.width * this.spriteWidth - 100 + 5, 10);
    const posText = `pos: ${this.mx}, ${this.my}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 200, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(posText, this.width * this.spriteWidth - 200 + 5, 10);
  }
  // drawing helpers
  drawSpriteAbsolute(index, x, y, background, foreground) {
    const image = this.sprites.get(index, background, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }
  drawSprite(index, x, y, background, foreground) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, background, foreground);
  }
  drawRect(x, y, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color.toCSS();
    ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
  drawLine(x, y, tx, ty, lineWidth, color) {
    const ctx = this.ctx;
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
};
var ui_default = UI;

// src/index.ts
var ui = new ui_default();
ui.initialize("canvas", "images/sprites.png", 64, 64, 16, 16).then(() => ui.start()).catch((err) => console.error(err));
