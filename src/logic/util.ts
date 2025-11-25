export function array2d<A>(width: number, height: number, value: A): A[][] {
  const result: A[][] = new Array(width);
  for (let x = 0; x < width; x++) {
    const inner: A[] = new Array(height);
    for (let y = 0; y < height; y++)
      inner[y] = value;
    result[x] = inner;
  }
  return result;
}
