import Color from "./color";

class Sprites {
  private readonly spriteWidth: number;
  private readonly spriteHeight: number;
  private readonly sprites: ImageBitmap[] = [];
  private readonly recolors: Map<string, ImageBitmap> = new Map();

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

  get(index: number, backgroundColor: Color, foregroundColor: Color, transparentColor: Color = Color.Transparent): ImageBitmap | null {
    const recolors = this.recolors;
    const hash = `${index},${Sprites.colorHash(backgroundColor)},${Sprites.colorHash(foregroundColor)}`;
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

  private static colorHash(c: Color): string {
    return `${c.r},${c.g},${c.b},${c.a}`;
  }

  private recolor(image: ImageBitmap, backgroundColor: Color, foregroundColor: Color, transparentColor: Color): ImageBitmap {
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
      const a = data[i + 3];
      if (a == 0) {
        // transparent
        data[i] = transparentColor.r;
        data[i + 1] = transparentColor.g;
        data[i + 2] = transparentColor.b;
        data[i + 3] = transparentColor.a;
      } else if (r == 255 && g == 255 && b == 255) {
        // white => background
        data[i] = backgroundColor.r;
        data[i + 1] = backgroundColor.g;
        data[i + 2] = backgroundColor.b;
        data[i + 3] = backgroundColor.a;
      } else {
        // any other color => foreground
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