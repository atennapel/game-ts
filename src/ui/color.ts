class Color {
  readonly r: number;
  readonly g: number;
  readonly b: number;
  readonly a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  equals(other: Color): boolean {
    return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
  }

  toCSS(): string {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }

  static Transparent = new Color(0, 0, 0, 0);
  static White = new Color(255, 255, 255, 255);
  static Black = new Color(0, 0, 0, 255);
  static Grey = new Color(127, 127, 127, 255);
  static DarkGrey = new Color(100, 100, 100, 255);
  static Red = new Color(255, 0, 0, 255);
  static Red155 = new Color(155, 0, 0, 255);
  static Blue = new Color(0, 255, 0, 255);
  static Green = new Color(0, 0, 255, 255);
  static Brown = new Color(150, 75, 0, 255);
  static BrightYellow = new Color(255, 234, 0, 255);

  static NotVisible = new Color(0, 0, 0, 0.5);
  static MouseIndicator = new Color(0, 160, 0, 0.5);
}

export default Color;