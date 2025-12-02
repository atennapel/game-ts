export function num2hex2(n: number): string {
  const s = n.toString(16);
  return n < 16 ? `0${s}` : s;
}

export function approxEquals(a: number, b: number, tolerance: number): boolean {
  return Math.abs(a - b) < tolerance;
}
