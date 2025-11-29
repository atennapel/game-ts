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

  equals(other: Color) {
    return this.r == other.r && this.g == other.g && this.b == other.b && this.a == other.a;
  }

  static Transparent = new Color(0, 0, 0, 0);
  static White = new Color(255, 255, 255, 255);
  static Black = new Color(0, 0, 0, 255);
  static Grey = new Color(127, 127, 127, 255);
  static Red = new Color(255, 0, 0, 255);
  static Blue = new Color(0, 255, 0, 255);
  static Green = new Color(0, 0, 255, 255);
  static Brown = new Color(150, 75, 0, 255);
}

export default Color;
