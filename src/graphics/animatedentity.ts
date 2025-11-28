class AnimatedEntity {
  x: number;
  y: number;
  absoluteX: number;
  absoluteY: number;
  private offsetX: number = 0;
  private offsetY: number = 0;
  private spriteWidth: number;
  private spriteHeight: number;
  animationSpeed: number = 0.25;

  constructor(x: number, y: number, spriteWidth: number, spriteHeight: number) {
    this.x = x;
    this.y = y;
    this.absoluteX = x * spriteWidth;
    this.absoluteY = y * spriteHeight;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
  }

  isAnimating(): boolean {
    return this.offsetX != 0 || this.offsetY != 0;
  }

  offset(dx: number, dy: number): void {
    this.offsetX = dx * this.spriteWidth;
    this.offsetY = dy * this.spriteHeight;
  }

  offsetTowards(x: number, y: number): void {
    if (x > this.x) this.offsetX = this.spriteWidth;
    else if (x < this.x) this.offsetX = -this.spriteWidth;
    if (y > this.y) this.offsetY = this.spriteHeight;
    else if (y < this.y) this.offsetY = -this.spriteHeight;
  }

  // TODO: bumping

  update(delta: number): boolean {
    let x = this.x;
    let y = this.y;
    let ox = this.offsetX;
    let oy = this.offsetY;
    let shouldRefreshVisiblity = false;

    if (ox > 0) {
      const dist = delta * this.animationSpeed;
      this.absoluteX += dist;
      ox -= dist;
      if (ox < 0.1) {
        ox = 0;
        x += 1;
        this.absoluteX = x * this.spriteWidth;
        shouldRefreshVisiblity = true;
      }
    } else if (ox < 0) {
      const dist = delta * this.animationSpeed;
      this.absoluteX -= dist;
      ox += dist;
      if (ox > -0.1) {
        ox = 0;
        x -= 1;
        this.absoluteX = x * this.spriteWidth;
        shouldRefreshVisiblity = true;
      }
    }
    if (oy > 0) {
      const dist = delta * this.animationSpeed;
      this.absoluteY += dist;
      oy -= dist;
      if (oy < 0.1) {
        oy = 0;
        y += 1;
        this.absoluteY = y * this.spriteHeight;
        shouldRefreshVisiblity = true;
      }
    } else if (oy < 0) {
      const dist = delta * this.animationSpeed;
      this.absoluteY -= dist;
      oy += dist;
      if (oy > -0.1) {
        oy = 0;
        y -= 1;
        this.absoluteY = y * this.spriteHeight;
        shouldRefreshVisiblity = true;
      }
    }

    this.x = x;
    this.y = y;
    this.offsetX = ox;
    this.offsetY = oy;

    return shouldRefreshVisiblity;
  }
}

export default AnimatedEntity;
