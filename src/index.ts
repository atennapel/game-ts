import Map from "./logic/map";
import Pathfinding from "./logic/pathfinding";
import Tile from "./logic/tile";

const map = new Map(40, 40);
for (let x = 0; x < 40; x++) {
  for (let y = 0; y < 40; y++) {
    if (x == 0 || y == 0 || x == 39 || y == 39)
      map.set(x, y, Tile.Wall);
  }
}

const pathfinding = new Pathfinding(map);

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d")!;

function drawBlock(x: number, y: number, style: string) {
  ctx.fillStyle = style;
  ctx.fillRect(x * 16, y * 16, 16, 16);
}

let sx = 1;
let sy = 1;
let gx = 10;
let gy = 10;

function update() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 40; y++) {
      if (map.isBlocked(x, y))
        drawBlock(x, y, "black");
      else
        drawBlock(x, y, "white");
    }
  }

  const path = pathfinding.findPath(sx, sy, gx, gy);
  drawBlock(sx, sy, "red");
  if (path) {
    for (const p of path)
      drawBlock(p.x, p.y, "green");
  }
}

update();

canvas.addEventListener("mousedown", event => {
  const x = Math.floor(event.offsetX / 16);
  const y = Math.floor(event.offsetY / 16);
  const t = map.get(x, y);
  if (t == Tile.Empty) map.set(x, y, Tile.Wall);
  else map.set(x, y, Tile.Empty);
  update();
});

canvas.addEventListener("mousemove", event => {
  gx = Math.floor(event.offsetX / 16);
  gy = Math.floor(event.offsetY / 16);
  update();
});

window.addEventListener("keydown", event => {
  if (event.key == "w") sy -= 1;
  else if (event.key == "s") sy += 1;
  if (event.key == "a") sx -= 1;
  else if (event.key == "d") sx += 1;
  update();
});
