// src/graphics/color.ts
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
  static White = new _Color(255, 255, 255, 255);
  static Black = new _Color(0, 0, 0, 255);
  static Grey = new _Color(127, 127, 127, 255);
  static Red = new _Color(255, 0, 0, 255);
  static Blue = new _Color(0, 255, 0, 255);
  static Green = new _Color(0, 0, 255, 255);
  static Transparent = new _Color(0, 0, 0, 0);
};
var color_default = Color;

// src/graphics/sprites.ts
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
    for (let y2 = 0; y2 < rows; y2++) {
      for (let x2 = 0; x2 < cols; x2++) {
        const bitmap = await createImageBitmap(image, x2 * spriteWidth, y2 * spriteHeight, spriteWidth, spriteHeight);
        this.sprites.push(bitmap);
      }
    }
  }
  async loadFromURL(url, width, height) {
    await fetch(url).then((response) => response.blob()).then((blob) => this.load(blob, width, height));
  }
  get(index, backgroundColor, foregroundColor) {
    const recolors = this.recolors;
    const hash = `${index},${_Sprites.colorHash(backgroundColor)},${_Sprites.colorHash(foregroundColor)}`;
    const recoloredImage = recolors.get(hash);
    if (recoloredImage) return recoloredImage;
    const image = this.sprites[index];
    if (image) {
      const newImage = this.recolor(image, backgroundColor, foregroundColor);
      recolors.set(hash, newImage);
      return newImage;
    }
    return null;
  }
  static colorHash(c) {
    return `${c.r},${c.g},${c.b},${c.a}`;
  }
  recolor(image, backgroundColor, foregroundColor) {
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const canvas2 = new OffscreenCanvas(spriteWidth, spriteHeight);
    const ctx2 = canvas2.getContext("2d");
    ctx2.drawImage(image, 0, 0);
    const imageData = ctx2.getImageData(0, 0, spriteWidth, spriteHeight);
    const data = imageData.data;
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      if (r == 255 && g == 255 && b == 255) {
        data[i] = backgroundColor.r;
        data[i + 1] = backgroundColor.g;
        data[i + 2] = backgroundColor.b;
        data[i + 3] = backgroundColor.a;
      } else {
        data[i] = foregroundColor.r;
        data[i + 1] = foregroundColor.g;
        data[i + 2] = foregroundColor.b;
        data[i + 3] = foregroundColor.a;
      }
    }
    ctx2.clearRect(0, 0, 16, 16);
    ctx2.putImageData(imageData, 0, 0);
    return canvas2.transferToImageBitmap();
  }
};
var sprites_default = Sprites;

// src/logic/tile.ts
var Tile = /* @__PURE__ */ ((Tile2) => {
  Tile2[Tile2["Empty"] = 0] = "Empty";
  Tile2[Tile2["Wall"] = 1] = "Wall";
  return Tile2;
})(Tile || {});
((Tile2) => {
  function isBlocked(tile) {
    return tile == 1 /* Wall */;
  }
  Tile2.isBlocked = isBlocked;
})(Tile || (Tile = {}));
var tile_default = Tile;

// src/util.ts
function array2d(width, height, value) {
  const result = new Array(width);
  for (let x2 = 0; x2 < width; x2++) {
    const inner = new Array(height);
    for (let y2 = 0; y2 < height; y2++)
      inner[y2] = value;
    result[x2] = inner;
  }
  return result;
}

// src/logic/map.ts
var Map2 = class {
  width;
  height;
  map;
  visible;
  explored;
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = array2d(width, height, tile_default.Empty);
    this.visible = array2d(width, height, false);
    this.explored = array2d(width, height, false);
  }
  set(x2, y2, tile) {
    this.map[x2][y2] = tile;
  }
  get(x2, y2) {
    return this.map[x2][y2];
  }
  isBlocked(x2, y2) {
    return tile_default.isBlocked(this.map[x2][y2]);
  }
  isVisible(x2, y2) {
    return this.visible[x2][y2];
  }
  isExplored(x2, y2) {
    return this.explored[x2][y2];
  }
  setVisible(x2, y2, isVisible) {
    this.visible[x2][y2] = isVisible;
    if (isVisible) this.explored[x2][y2] = true;
  }
  setExplored(x2, y2, isExplored) {
    this.explored[x2][y2] = isExplored;
  }
  reset() {
    const width = this.width;
    const height = this.height;
    for (let x2 = 0; x2 < width; x2++) {
      for (let y2 = 0; y2 < height; y2++) {
        this.visible[x2][y2] = false;
        this.explored[x2][y2] = false;
      }
    }
  }
};
var map_default = Map2;

// src/logic/pos.ts
var Pos = class {
  x;
  y;
  constructor(x2, y2) {
    this.x = x2;
    this.y = y2;
  }
  toString() {
    return `(${this.x}, ${this.y})`;
  }
};
var pos_default = Pos;

// src/logic/priorityqueue.ts
var PriorityQueue = class {
  _queue;
  _size = 0;
  _comparator;
  constructor(initialCapacity, comparator) {
    const cap = initialCapacity ?? 11;
    const com = comparator ?? null;
    if (cap < 1) {
      throw new Error("initial capacity must be greater than or equal to 1");
    }
    this._queue = new Array(cap);
    this._comparator = com;
  }
  grow() {
    const oldCapacity = this._size;
    const newCapacity = oldCapacity + (oldCapacity < 64 ? oldCapacity + 2 : oldCapacity >> 1);
    if (!Number.isSafeInteger(newCapacity)) {
      throw new Error("capacity out of range");
    }
    this._queue.length = newCapacity;
  }
  siftup(k, item) {
    if (this._comparator !== null) {
      this.siftupUsingComparator(k, item);
    } else {
      this.siftupComparable(k, item);
    }
  }
  /**
   * siftup of heap
   */
  siftupUsingComparator(k, item) {
    while (k > 0) {
      let parent = k - 1 >>> 1;
      let e = this._queue[parent];
      if (this._comparator(item, e) >= 0) {
        break;
      }
      this._queue[k] = e;
      k = parent;
    }
    this._queue[k] = item;
  }
  siftupComparable(k, item) {
    while (k > 0) {
      let parent = k - 1 >>> 1;
      let e = this._queue[parent];
      if (item.toString().localeCompare(e.toString()) >= 0) {
        break;
      }
      this._queue[k] = e;
      k = parent;
    }
    this._queue[k] = item;
  }
  sink(k, item) {
    if (this._comparator !== null) {
      this.sinkUsingComparator(k, item);
    } else {
      this.sinkComparable(k, item);
    }
  }
  sinkUsingComparator(k, item) {
    let half = this._size >>> 1;
    while (k < half) {
      let child = (k << 1) + 1;
      let object = this._queue[child];
      let right = child + 1;
      if (right < this._size && this._comparator(object, this._queue[right]) > 0) {
        object = this._queue[child = right];
      }
      if (this._comparator(item, object) <= 0) {
        break;
      }
      this._queue[k] = object;
      k = child;
    }
    this._queue[k] = item;
  }
  sinkComparable(k, item) {
    let half = this._size >>> 1;
    while (k < half) {
      let child = (k << 1) + 1;
      let object = this._queue[child];
      let right = child + 1;
      if (right < this._size && object.toString().localeCompare(this._queue[right].toString())) {
        object = this._queue[child = right];
      }
      if (item.toString().localeCompare(object.toString()) <= 0) {
        break;
      }
      this._queue[k] = object;
      k = child;
    }
    this._queue[k] = item;
  }
  indexOf(item) {
    for (let i = 0; i < this._queue.length; i++) {
      if (this._queue[i] === item) {
        return i;
      }
    }
    return -1;
  }
  add(item) {
    let i = this._size;
    if (i >= this._queue.length) {
      this.grow();
    }
    this._size = i + 1;
    if (i === 0) {
      this._queue[0] = item;
    } else {
      this.siftup(i, item);
    }
    return true;
  }
  poll() {
    if (this._size === 0) {
      return null;
    }
    let s = --this._size;
    let result = this._queue[0];
    let x2 = this._queue[s];
    this._queue.slice(s, 1);
    if (s !== 0) {
      this.sink(0, x2);
    }
    return result;
  }
  peek() {
    return this._size === 0 ? null : this._queue[0];
  }
  contains(item) {
    return this.indexOf(item) !== -1;
  }
  clear() {
    for (let item of this._queue) {
      item = null;
    }
    this._size = 0;
  }
  size() {
    return this._size;
  }
  empty() {
    return this._size === 0;
  }
  toArray() {
    return this._queue.filter((item) => item);
  }
  toString() {
    return this.toArray().toString();
  }
  [Symbol.iterator]() {
    let i = 0;
    return {
      next: () => {
        return {
          done: i == this._size,
          value: this._queue[i++]
        };
      }
    };
  }
};
var priorityqueue_default = PriorityQueue;

// src/logic/pathfinding.ts
var Loc = class _Loc {
  x;
  y;
  hash;
  priority;
  constructor(x2, y2, priority) {
    this.x = x2;
    this.y = y2;
    this.hash = x2 * 1e5 + y2;
    this.priority = priority;
  }
  compare(other) {
    return this.priority - other.priority;
  }
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }
  neighbours(map2) {
    const ns = [];
    const x2 = this.x;
    const y2 = this.y;
    for (let nx = x2 - 1; nx <= x2 + 1; nx++) {
      for (let ny = y2 - 1; ny <= y2 + 1; ny++) {
        if (nx < 0 || nx >= map2.width || ny < 0 || ny >= map2.height || nx == x2 && ny == y2 || map2.isBlocked(nx, ny))
          continue;
        ns.push(new _Loc(nx, ny, 0));
      }
    }
    return ns;
  }
  toString() {
    return `(${this.x}, ${this.y}, ${this.priority})`;
  }
};
var PathFinding = class _PathFinding {
  map;
  constructor(map2) {
    this.map = map2;
  }
  static heuristic(x2, y2, gx2, gy2) {
    const ox2 = Math.abs(gx2 - x2);
    const oy2 = Math.abs(gy2 - y2);
    const diagonal = Math.min(ox2, oy2);
    const straight = Math.max(ox2, oy2) - diagonal;
    return straight * 10 + diagonal * 11;
  }
  cost(x2, y2) {
    return 10;
  }
  findPath(x2, y2, gx2, gy2) {
    const cameFrom = /* @__PURE__ */ new Map();
    const costSoFar = /* @__PURE__ */ new Map();
    const frontier = new priorityqueue_default(10, (a, b) => a.compare(b));
    const goal = new Loc(gx2, gy2, 0);
    const start = new Loc(x2, y2, 0);
    frontier.add(start);
    cameFrom.set(start.hash, start);
    costSoFar.set(start.hash, 0);
    while (frontier.size() > 0) {
      const current2 = frontier.poll();
      if (current2.equals(goal)) break;
      for (const next of current2.neighbours(this.map)) {
        const newCost = costSoFar.get(current2.hash) + this.cost(next.x, next.y);
        if (!costSoFar.has(next.hash) || newCost < costSoFar.get(next.hash)) {
          costSoFar.set(next.hash, newCost);
          const priority = newCost + _PathFinding.heuristic(next.x, next.y, gx2, gy2);
          frontier.add(new Loc(next.x, next.y, priority));
          cameFrom.set(next.hash, current2);
        }
      }
    }
    if (!cameFrom.get(goal.hash)) return null;
    const result = [new pos_default(gx2, gy2)];
    let current = goal;
    while (!current.equals(start)) {
      const next = cameFrom.get(current.hash);
      if (next.equals(start)) {
        result.reverse();
        return result;
      }
      result.push(new pos_default(next.x, next.y));
      current = next;
    }
    return null;
  }
};
var pathfinding_default = PathFinding;

// src/logic/shadowcasting.ts
var Shadow = class _Shadow {
  start;
  end;
  constructor(start, end) {
    this.start = start;
    this.end = end;
  }
  contains(other) {
    return this.start <= other.start && this.end >= other.end;
  }
  static projectTile(row, col) {
    const topLeft = col / (row + 2);
    const bottomRight = (col + 1) / (row + 1);
    return new _Shadow(topLeft, bottomRight);
  }
};
var ShadowLine = class {
  shadows = [];
  isInShadow(proj) {
    for (const s of this.shadows)
      if (s.contains(proj))
        return true;
    return false;
  }
  isFullShadow() {
    const shadows = this.shadows;
    return shadows.length == 1 && shadows[0].start == 0 && shadows[0].end == 1;
  }
  add(shadow) {
    const shadows = this.shadows;
    let index = 0;
    for (; index < shadows.length; index++) {
      if (shadows[index].start >= shadow.start)
        break;
    }
    let overlappingPrevious = null;
    if (index > 0 && shadows[index - 1].end > shadow.start)
      overlappingPrevious = shadows[index - 1];
    let overlappingNext = null;
    if (index < shadows.length && shadows[index].start < shadow.end)
      overlappingNext = shadows[index];
    if (overlappingNext) {
      if (overlappingPrevious) {
        overlappingPrevious.end = overlappingNext.end;
        shadows.splice(index, 1);
      } else {
        overlappingNext.start = shadow.start;
      }
    } else {
      if (overlappingPrevious) {
        overlappingPrevious.end = shadow.end;
      } else {
        shadows.splice(index, 0, shadow);
      }
    }
  }
};
var ShadowCasting = class _ShadowCasting {
  map;
  constructor(map2) {
    this.map = map2;
  }
  refreshVisibility(x2, y2) {
    this.refreshOctant(x2, y2, 0);
    this.refreshOctant(x2, y2, 1);
    this.refreshOctant(x2, y2, 2);
    this.refreshOctant(x2, y2, 3);
    this.refreshOctant(x2, y2, 4);
    this.refreshOctant(x2, y2, 5);
    this.refreshOctant(x2, y2, 6);
    this.refreshOctant(x2, y2, 7);
    this.map.setVisible(x2, y2, true);
  }
  refreshOctant(x2, y2, octant) {
    const width = this.map.width;
    const height = this.map.height;
    const line = new ShadowLine();
    let fullShadow = false;
    for (let row = 1; ; row++) {
      const posOctantTop = _ShadowCasting.transformOctant(row, 0, octant);
      const posXTop = x2 + posOctantTop.x;
      const posYTop = y2 + posOctantTop.y;
      if (posXTop < 0 || posXTop >= width || posYTop < 0 || posYTop >= height) break;
      for (let col = 0; col <= row; col++) {
        const posOctant = _ShadowCasting.transformOctant(row, col, octant);
        const posX = x2 + posOctant.x;
        const posY = y2 + posOctant.y;
        if (posX < 0 || posX >= width || posY < 0 || posY >= height) break;
        if (fullShadow)
          this.map.setVisible(posX, posY, false);
        else {
          const proj = Shadow.projectTile(row, col);
          const visible = !line.isInShadow(proj);
          this.map.setVisible(posX, posY, visible);
          if (visible && this.map.isBlocked(posX, posY)) {
            line.add(proj);
            fullShadow = line.isFullShadow();
          }
        }
      }
    }
  }
  static transformOctant(row, col, octant) {
    switch (octant) {
      case 0:
        return new pos_default(col, -row);
      case 1:
        return new pos_default(row, -col);
      case 2:
        return new pos_default(row, col);
      case 3:
        return new pos_default(col, row);
      case 4:
        return new pos_default(-col, row);
      case 5:
        return new pos_default(-row, col);
      case 6:
        return new pos_default(-row, -col);
      case 7:
        return new pos_default(-col, -row);
    }
  }
};
var shadowcasting_default = ShadowCasting;

// src/index.ts
var map = new map_default(40, 40);
for (let x2 = 0; x2 < 40; x2++) {
  for (let y2 = 0; y2 < 40; y2++) {
    if (x2 == 0 || y2 == 0 || x2 == 39 || y2 == 39)
      map.set(x2, y2, tile_default.Wall);
  }
}
var pathfinding = new pathfinding_default(map);
var shadowcasting = new shadowcasting_default(map);
var sprites = new sprites_default(16, 16);
var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");
function drawBlock(x2, y2, style) {
  ctx.fillStyle = style;
  ctx.fillRect(x2 * 16, y2 * 16, 16, 16);
}
function drawSpriteAbs(x2, y2, index, foreground) {
  const image = sprites.get(index, color_default.White, foreground);
  if (image) ctx.drawImage(image, x2, y2);
}
function drawSprite(x2, y2, index, foreground) {
  drawSpriteAbs(x2 * 16, y2 * 16, index, foreground);
}
function drawTile(x2, y2) {
  const visible = map.isVisible(x2, y2);
  const tile = map.get(x2, y2);
  if (visible) {
    if (tile == tile_default.Empty) {
      drawBlock(x2, y2, "white");
    } else {
      drawSprite(x2, y2, 1, color_default.Black);
    }
  } else {
    if (map.isExplored(x2, y2)) {
      if (tile == tile_default.Wall)
        drawSprite(x2, y2, 1, color_default.Grey);
      else
        drawBlock(x2, y2, "grey");
    } else {
      drawBlock(x2, y2, "black");
    }
  }
}
var x = 16;
var y = 16;
var sx = 1;
var sy = 1;
var ox = 0;
var oy = 0;
var gx = 0;
var gy = 0;
var path = null;
var keyZ = false;
var keyX = false;
function draw() {
  for (let x2 = 0; x2 < 40; x2++) {
    for (let y2 = 0; y2 < 40; y2++) {
      drawTile(x2, y2);
    }
  }
  ctx.fillStyle = "green";
  ctx.fillRect(gx * 16, gy * 16, 16, 16);
  if (path) {
    for (const p of path)
      ctx.fillRect(p.x * 16, p.y * 16, 16, 16);
  }
  drawSpriteAbs(x, y, 0, color_default.Black);
}
canvas.addEventListener("mousedown", (event) => {
  gx = Math.floor(event.offsetX / 16);
  gy = Math.floor(event.offsetY / 16);
  path = pathfinding.findPath(sx, sy, gx, gy);
  if (path) path.reverse();
});
canvas.addEventListener("mousemove", (event) => {
  gx = Math.floor(event.offsetX / 16);
  gy = Math.floor(event.offsetY / 16);
  if (keyZ) {
    map.set(gx, gy, tile_default.Empty);
    shadowcasting.refreshVisibility(sx, sy);
  } else if (keyX) {
    map.set(gx, gy, tile_default.Wall);
    shadowcasting.refreshVisibility(sx, sy);
  }
});
window.addEventListener("keydown", (event) => {
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
    map.set(gx, gy, tile_default.Empty);
    shadowcasting.refreshVisibility(sx, sy);
  } else if (event.key == "x") {
    keyX = true;
    map.set(gx, gy, tile_default.Wall);
    shadowcasting.refreshVisibility(sx, sy);
  }
});
window.addEventListener("keyup", (event) => {
  if (event.key == "z") {
    keyZ = false;
  } else if (event.key == "x") {
    keyX = false;
  }
});
window.addEventListener("keypress", (event) => {
  if (event.key == "r") {
    map.reset();
    shadowcasting.refreshVisibility(sx, sy);
    draw();
  }
});
sprites.loadFromURL("images/sprites.bmp", 32, 32).then(() => {
  shadowcasting.refreshVisibility(sx, sy);
  loop(0);
}).catch((err) => console.error(err));
var SPEED = 0.25;
var lastTime = 0;
function loop(time) {
  const delta = lastTime == 0 ? 0 : time - lastTime;
  lastTime = time;
  if (path) {
    if (path.length > 0) {
      if (ox == 0 && oy == 0) {
        const nextPos = path.pop();
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
