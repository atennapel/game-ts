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
  for (let x = 0; x < width; x++) {
    const inner = new Array(height);
    for (let y = 0; y < height; y++)
      inner[y] = value;
    result[x] = inner;
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
  set(x, y, tile) {
    this.map[x][y] = tile;
  }
  get(x, y) {
    return this.map[x][y];
  }
  isBlocked(x, y) {
    return tile_default.isBlocked(this.map[x][y]);
  }
  isVisible(x, y) {
    return this.visible[x][y];
  }
  isExplored(x, y) {
    return this.explored[x][y];
  }
  setVisible(x, y, isVisible) {
    this.visible[x][y] = isVisible;
    if (isVisible) this.explored[x][y] = true;
  }
  setExplored(x, y, isExplored) {
    this.explored[x][y] = isExplored;
  }
  reset() {
    const width = this.width;
    const height = this.height;
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        this.visible[x][y] = false;
        this.explored[x][y] = false;
      }
    }
  }
};
var map_default = Map2;

// src/logic/pos.ts
var Pos = class {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
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
    let x = this._queue[s];
    this._queue.slice(s, 1);
    if (s !== 0) {
      this.sink(0, x);
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
  constructor(x, y, priority) {
    this.x = x;
    this.y = y;
    this.hash = x * 1e5 + y;
    this.priority = priority;
  }
  compare(other) {
    return this.priority - other.priority;
  }
  equals(other) {
    return this.x == other.x && this.y == other.y;
  }
  neighbours(map) {
    const ns = [];
    const x = this.x;
    const y = this.y;
    for (let nx = x - 1; nx <= x + 1; nx++) {
      for (let ny = y - 1; ny <= y + 1; ny++) {
        if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height || nx == x && ny == y || map.isBlocked(nx, ny))
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
  constructor(map) {
    this.map = map;
  }
  static heuristic(x, y, gx, gy) {
    const ox = Math.abs(gx - x);
    const oy = Math.abs(gy - y);
    const diagonal = Math.min(ox, oy);
    const straight = Math.max(ox, oy) - diagonal;
    return straight * 10 + diagonal * 11;
  }
  cost(x, y) {
    return 10;
  }
  findPath(x, y, gx, gy) {
    const cameFrom = /* @__PURE__ */ new Map();
    const costSoFar = /* @__PURE__ */ new Map();
    const frontier = new priorityqueue_default(10, (a, b) => a.compare(b));
    const goal = new Loc(gx, gy, 0);
    const start = new Loc(x, y, 0);
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
          const priority = newCost + _PathFinding.heuristic(next.x, next.y, gx, gy);
          frontier.add(new Loc(next.x, next.y, priority));
          cameFrom.set(next.hash, current2);
        }
      }
    }
    if (!cameFrom.get(goal.hash)) return null;
    const result = [new pos_default(gx, gy)];
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
  constructor(map) {
    this.map = map;
  }
  refreshVisibility(x, y) {
    this.refreshOctant(x, y, 0);
    this.refreshOctant(x, y, 1);
    this.refreshOctant(x, y, 2);
    this.refreshOctant(x, y, 3);
    this.refreshOctant(x, y, 4);
    this.refreshOctant(x, y, 5);
    this.refreshOctant(x, y, 6);
    this.refreshOctant(x, y, 7);
    this.map.setVisible(x, y, true);
  }
  refreshOctant(x, y, octant) {
    const width = this.map.width;
    const height = this.map.height;
    const line = new ShadowLine();
    let fullShadow = false;
    for (let row = 1; ; row++) {
      const posOctantTop = _ShadowCasting.transformOctant(row, 0, octant);
      const posXTop = x + posOctantTop.x;
      const posYTop = y + posOctantTop.y;
      if (posXTop < 0 || posXTop >= width || posYTop < 0 || posYTop >= height) break;
      for (let col = 0; col <= row; col++) {
        const posOctant = _ShadowCasting.transformOctant(row, col, octant);
        const posX = x + posOctant.x;
        const posY = y + posOctant.y;
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
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const bitmap = await createImageBitmap(image, x * spriteWidth, y * spriteHeight, spriteWidth, spriteHeight);
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
    const canvas = new OffscreenCanvas(spriteWidth, spriteHeight);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(image, 0, 0);
    const imageData = ctx.getImageData(0, 0, spriteWidth, spriteHeight);
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
    ctx.clearRect(0, 0, 16, 16);
    ctx.putImageData(imageData, 0, 0);
    return canvas.transferToImageBitmap();
  }
};
var sprites_default = Sprites;

// src/graphics/main.ts
var Main = class {
  running = false;
  lastTime;
  width = 20;
  height = 20;
  originalSpriteWidth = 16;
  originalSpriteHeight = 16;
  spriteWidth = 32;
  spriteHeight = 32;
  map = new map_default(this.width, this.height);
  pathfinding = new pathfinding_default(this.map);
  shadowcasting = new shadowcasting_default(this.map);
  x = 1;
  y = 1;
  ax = this.spriteWidth;
  ay = this.spriteHeight;
  ox = 0;
  oy = 0;
  gx = 0;
  gy = 0;
  revPath = null;
  mx = 0;
  my = 0;
  ctx;
  sprites = new sprites_default(this.originalSpriteWidth, this.originalSpriteHeight);
  animationSpeed = 0.25;
  constructor() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        if (x == 0 || x == this.width - 1 || y == 0 || y == this.height - 1)
          this.map.set(x, y, tile_default.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, tile_default.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, tile_default.Empty);
        if (x == 8 && y == 6)
          this.map.set(x, y, tile_default.Empty);
      }
    }
  }
  async initialize(canvasId, spriteSheetUrl, spriteSheetWidth, spriteSheetHeight) {
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    window.addEventListener("mousemove", (event) => this.handleMouseMove(event));
    window.addEventListener("mousedown", (event) => this.handleMouseDown(event));
  }
  start() {
    this.running = true;
    requestAnimationFrame((time) => {
      this.lastTime = time;
      this.shadowcasting.refreshVisibility(this.x, this.y);
      requestAnimationFrame((time2) => this.loop(time2));
    });
  }
  stop() {
    this.running = false;
  }
  handleMouseMove(event) {
    this.mx = Math.floor(event.offsetX / this.spriteWidth);
    this.my = Math.floor(event.offsetY / this.spriteHeight);
  }
  handleMouseDown(event) {
    if (event.buttons == 1) {
      const path = this.pathfinding.findPath(this.x, this.y, this.mx, this.my);
      if (path) {
        this.gx = this.mx;
        this.gy = this.my;
        path.reverse();
        this.revPath = path;
      }
    }
  }
  loop(time) {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.logic(delta);
    this.draw();
    requestAnimationFrame((time2) => this.loop(time2));
  }
  logic(delta) {
    let x = this.x;
    let y = this.y;
    let ox = this.ox;
    let oy = this.oy;
    const path = this.revPath;
    if (path) {
      if (path.length > 0) {
        if (ox == 0 && oy == 0) {
          const nextPos = path.pop();
          if (nextPos.x > x) ox = this.spriteWidth;
          else if (nextPos.x < x) ox = -this.spriteWidth;
          if (nextPos.y > y) oy = this.spriteHeight;
          else if (nextPos.y < y) oy = -this.spriteHeight;
        }
      } else this.revPath = null;
    }
    if (ox > 0) {
      const dist = delta * this.animationSpeed;
      this.ax += dist;
      ox -= dist;
      if (ox < 0.1) {
        ox = 0;
        x += 1;
        this.ax = x * this.spriteWidth;
        this.shadowcasting.refreshVisibility(x, y);
      }
    } else if (ox < 0) {
      const dist = delta * this.animationSpeed;
      this.ax -= dist;
      ox += dist;
      if (ox > -0.1) {
        ox = 0;
        x -= 1;
        this.ax = x * this.spriteWidth;
        this.shadowcasting.refreshVisibility(x, y);
      }
    }
    if (oy > 0) {
      const dist = delta * this.animationSpeed;
      this.ay += dist;
      oy -= dist;
      if (oy < 0.1) {
        oy = 0;
        y += 1;
        this.ay = y * this.spriteHeight;
        this.shadowcasting.refreshVisibility(x, y);
      }
    } else if (oy < 0) {
      const dist = delta * this.animationSpeed;
      this.ay -= dist;
      oy += dist;
      if (oy > -0.1) {
        oy = 0;
        y -= 1;
        this.ay = y * this.spriteHeight;
        this.shadowcasting.refreshVisibility(x, y);
      }
    }
    this.x = x;
    this.y = y;
    this.ox = ox;
    this.oy = oy;
  }
  draw() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.drawTile(x, y);
      }
    }
    this.drawSpriteAbsolute(0, this.ax, this.ay, color_default.Black);
    if (this.revPath)
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");
    this.drawRect(this.mx, this.my, "rgba(0, 160, 0, 0.5)");
  }
  drawTile(x, y) {
    const map = this.map;
    const visible = map.isVisible(x, y);
    const tile = map.get(x, y);
    if (visible) {
      if (tile == tile_default.Empty) {
        this.drawRect(x, y, "white");
      } else {
        this.drawSprite(1, x, y, color_default.Black);
      }
    } else {
      if (map.isExplored(x, y)) {
        if (tile == tile_default.Wall)
          this.drawSprite(1, x, y, color_default.Grey);
        else
          this.drawRect(x, y, "grey");
      } else {
        this.drawRect(x, y, "black");
      }
    }
  }
  drawRect(x, y, style) {
    this.ctx.fillStyle = style;
    this.ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
  drawSpriteAbsolute(index, x, y, foreground) {
    const image = this.sprites.get(index, color_default.White, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }
  drawSprite(index, x, y, foreground) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground);
  }
};
var main_default = Main;

// src/index.ts
var main = new main_default();
main.initialize("canvas", "images/sprites.bmp", 32, 32).then(() => main.start()).catch((err) => console.error(err));
