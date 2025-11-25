import Color from "./color";

class Recolor {
  readonly background: Color;
  readonly foreground: Color;
  readonly image: ImageBitmap;

  constructor(background: Color, foreground: Color, image: ImageBitmap) {
    this.background = background;
    this.foreground = foreground;
    this.image = image;
  }
}

class Sprites {
  private readonly spriteWidth: number;
  private readonly spriteHeight: number;
  private readonly sprites: ImageBitmap[] = [];
  private readonly recolors: Map<number, Recolor[]> = new Map();

  constructor(spriteWidth: number, spriteHeight: number) {
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  async load(image: ImageBitmapSource, width: number, height: number): Promise<void> {
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

  async loadFromURL(url: string, width: number, height: number): Promise<void> {
    await fetch(url)
      .then(response => response.blob())
      .then(blob => this.load(blob, width, height));
  }

  get(index: number, backgroundColor: Color, foregroundColor: Color): ImageBitmap | null {
    const recolors = this.recolors;
    let arr: Recolor[];
    if (recolors.has(index)) {
      arr = recolors.get(index)!;
      for (let i = 0; i < arr.length; i++) {
        const recolor = arr[i];
        if (recolor.background.equals(backgroundColor) && recolor.foreground.equals(foregroundColor))
          return recolor.image;
      }
    } else {
      arr = [];
      recolors.set(index, arr);
    }
    const image = this.sprites[index];
    if (image) {
      const newImage = this.recolor(image, backgroundColor, foregroundColor);
      arr.push(new Recolor(backgroundColor, foregroundColor, newImage));
      return newImage;
    }
    return null;
  }

  private recolor(image: ImageBitmap, backgroundColor: Color, foregroundColor: Color): ImageBitmap {
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const canvas = new OffscreenCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, spriteWidth, spriteHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r == 255 && g == 255 && b == 255) {
        // background
        data[i] = backgroundColor.r;
        data[i + 1] = backgroundColor.g;
        data[i + 2] = backgroundColor.b;
        data[i + 3] = backgroundColor.a;
      } else {
        // foreground
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
}

export default Sprites;
