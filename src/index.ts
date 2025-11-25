import Color from "./graphics/color";
import Sprites from "./graphics/sprites";
import Map from "./logic/map";
import PathFinding from "./logic/pathfinding";
import Pos from "./logic/pos";
import ShadowCasting from "./logic/shadowcasting";
import Tile from "./logic/tile";

const map = new Map(40, 40);
for (let x = 0; x < 40; x++) {
  for (let y = 0; y < 40; y++) {
    if (x == 0 || y == 0 || x == 39 || y == 39)
      map.set(x, y, Tile.Wall);
  }
}

const pathfinding = new PathFinding(map);
const shadowcasting = new ShadowCasting(map);

const sprites = new Sprites(16, 16);

const canvas = <HTMLCanvasElement>document.getElementById("canvas");
const ctx = canvas.getContext("2d")!;

function drawBlock(x: number, y: number, style: string) {
  ctx.fillStyle = style;
  ctx.fillRect(x * 16, y * 16, 16, 16);
}

function drawSpriteAbs(x: number, y: number, index: number, foreground: Color) {
  const image = sprites.get(index, Color.White, foreground);
  if (image) ctx.drawImage(image, x, y);
}

function drawSprite(x: number, y: number, index: number, foreground: Color) {
  drawSpriteAbs(x * 16, y * 16, index, foreground);
}

function drawTile(x: number, y: number) {
  const visible = map.isVisible(x, y);
  const tile = map.get(x, y);
  if (visible) {
    if (tile == Tile.Empty) {
      drawBlock(x, y, "white");
    } else {
      drawSprite(x, y, 1, Color.Black);
    }
  } else {
    if (map.isExplored(x, y)) {
      if (tile == Tile.Wall)
        drawSprite(x, y, 1, Color.Grey);
      else
        drawBlock(x, y, "grey");
    } else {
      drawBlock(x, y, "black");
    }
  }
}

let x = 16;
let y = 16;
let sx = 1;
let sy = 1;
let ox = 0;
let oy = 0;
let gx = 0;
let gy = 0;
let path: Pos[] | null = null;
let lastPlaced: Pos | null = null;

let keyZ = false;
let keyX = false;

function draw() {
  for (let x = 0; x < 40; x++) {
    for (let y = 0; y < 40; y++) {
      drawTile(x, y);
    }
  }

  ctx.fillStyle = "green";
  ctx.fillRect(gx * 16, gy * 16, 16, 16);
  if (path) {
    for (const p of path)
      ctx.fillRect(p.x * 16, p.y * 16, 16, 16);
  }

  drawSpriteAbs(x, y, 0, Color.Black);
}

canvas.addEventListener("mousedown", event => {
  gx = Math.floor(event.offsetX / 16);
  gy = Math.floor(event.offsetY / 16);
  // const t = map.get(x, y);
  // if (t == Tile.Empty) map.set(x, y, Tile.Wall);
  // else map.set(x, y, Tile.Empty);
  // shadowcasting.refreshVisibility(sx, sy);
  path = pathfinding.findPath(sx, sy, gx, gy);
  if (path) path.reverse();
});

canvas.addEventListener("mousemove", event => {
  gx = Math.floor(event.offsetX / 16);
  gy = Math.floor(event.offsetY / 16);
  /*
  const x = Math.floor(event.offsetX / 16);
  const y = Math.floor(event.offsetY / 16);
  if (event.buttons == 1) {
    const t = map.get(x, y);
    if (t == Tile.Empty) map.set(x, y, Tile.Wall);
    else map.set(x, y, Tile.Empty);
    shadowcasting.refreshVisibility(sx, sy);
  }*/
  if (keyZ) {
    map.set(gx, gy, Tile.Empty);
    shadowcasting.refreshVisibility(sx, sy);
  } else if (keyX) {
    map.set(gx, gy, Tile.Wall);
    shadowcasting.refreshVisibility(sx, sy);
  }
});

window.addEventListener("keydown", event => {
  if (oy == 0) {
    if (event.key == "w") oy = -16;
    else if (event.key == "s") oy = 16;
  }
  if (ox == 0) {
    if (event.key == "a") ox = -16;
    else if (event.key == "d") ox = 16;
  }
  if (event.key == "z") {
    keyZ = true;
    map.set(gx, gy, Tile.Empty);
    shadowcasting.refreshVisibility(sx, sy);
  } else if (event.key == "x") {
    keyX = true;
    map.set(gx, gy, Tile.Wall);
    shadowcasting.refreshVisibility(sx, sy);
  }
});

window.addEventListener("keyup", event => {
  if (event.key == "z") {
    keyZ = false;
  } else if (event.key == "x") {
    keyX = false;
  }
});

window.addEventListener("keypress", event => {
  if (event.key == "r") {
    map.reset();
    shadowcasting.refreshVisibility(sx, sy);
    draw();
  }
});

sprites.loadFromURL("images/sprites.bmp", 32, 32)
  .then(() => {
    shadowcasting.refreshVisibility(sx, sy);
    loop(0);
  })
  .catch(err => console.error(err));

const SPEED = 0.25;
let lastTime = 0;
function loop(time: DOMHighResTimeStamp) {
  const delta = lastTime == 0 ? 0 : time - lastTime;
  lastTime = time;

  if (path) {
    if (path.length > 0) {
      if (ox == 0 && oy == 0) {
        const nextPos = path.pop()!;
        if (nextPos.x > sx) ox = 16;
        else if (nextPos.x < sx) ox = -16;
        if (nextPos.y > sy) oy = 16;
        else if (nextPos.y < sy) oy = -16;
      }
    } else path = null;
  }

  if (ox > 0) {
    const dist = delta * SPEED;
    x += dist;
    ox -= dist;
    if (ox < 0.1) {
      ox = 0;
      sx += 1;
      x = sx * 16;
      shadowcasting.refreshVisibility(sx, sy);
    }
  } else if (ox < 0) {
    const dist = delta * SPEED;
    x -= dist;
    ox += dist;
    if (ox > -0.1) {
      ox = 0;
      sx -= 1;
      x = sx * 16;
      shadowcasting.refreshVisibility(sx, sy);
    }
  }
  if (oy > 0) {
    const dist = delta * SPEED;
    y += dist;
    oy -= dist;
    if (oy < 0.1) {
      oy = 0;
      sy += 1;
      y = sy * 16;
      shadowcasting.refreshVisibility(sx, sy);
    }
  } else if (oy < 0) {
    const dist = delta * SPEED;
    y -= dist;
    oy += dist;
    if (oy > -0.1) {
      oy = 0;
      sy -= 1;
      y = sy * 16;
      shadowcasting.refreshVisibility(sx, sy);
    }
  }

  draw();
  requestAnimationFrame(loop);
}
