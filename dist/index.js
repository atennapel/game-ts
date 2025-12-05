"use strict";

// src/game/world/pos.ts
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

// src/game/priorityqueue.ts
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

// src/game/pathfinding.ts
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
    const { x, y } = this;
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

// src/game/shadowcasting.ts
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
          if (visible && this.map.blocksView(posX, posY)) {
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

// src/game/world/tile.ts
var Tile = /* @__PURE__ */ ((Tile2) => {
  Tile2[Tile2["Empty"] = 0] = "Empty";
  Tile2[Tile2["Wall"] = 1] = "Wall";
  Tile2[Tile2["Fire"] = 2] = "Fire";
  return Tile2;
})(Tile || {});
((Tile2) => {
  function isBlocked(tile) {
    switch (tile) {
      case 1 /* Wall */:
        return true;
      case 2 /* Fire */:
        return true;
      default:
        return false;
    }
  }
  Tile2.isBlocked = isBlocked;
  function blocksView(tile) {
    return tile == 1 /* Wall */;
  }
  Tile2.blocksView = blocksView;
  function description(tile) {
    switch (tile) {
      case 2 /* Fire */:
        return "fire";
      default:
        return null;
    }
  }
  Tile2.description = description;
})(Tile || (Tile = {}));
var tile_default = Tile;

// src/game/world/map.ts
var Map2 = class _Map {
  width;
  height;
  map;
  visible;
  explored;
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.map = _Map.array2d(width, height, tile_default.Empty);
    this.visible = _Map.array2d(width, height, false);
    this.explored = _Map.array2d(width, height, false);
  }
  static array2d(width, height, value) {
    const result = new Array(width);
    for (let x = 0; x < width; x++) {
      const inner = new Array(height);
      for (let y = 0; y < height; y++)
        inner[y] = value;
      result[x] = inner;
    }
    return result;
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
  blocksView(x, y) {
    return tile_default.blocksView(this.map[x][y]);
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
};
var map_default = Map2;

// src/game/world/world.ts
var World = class {
  map;
  constructor(width, height) {
    this.map = new map_default(width, height);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
          this.map.set(x, y, tile_default.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, tile_default.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, tile_default.Empty);
      }
    }
    this.map.set(9, 2, tile_default.Fire);
  }
};
var world_default = World;

// src/game/game.ts
var Game = class {
  world;
  pathfinding;
  shadowcasting;
  constructor(width, height) {
    this.world = new world_default(width, height);
    this.pathfinding = new pathfinding_default(this.world.map);
    this.shadowcasting = new shadowcasting_default(this.world.map);
  }
  findPath(x, y, gx, gy) {
    return this.pathfinding.findPath(x, y, gx, gy);
  }
  refreshVisibility(x, y) {
    this.shadowcasting.refreshVisibility(x, y);
  }
};
var game_default = Game;

// src/ui/color.ts
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
  toCSS() {
    return `rgba(${this.r},${this.g},${this.b},${this.a})`;
  }
  static Transparent = new _Color(0, 0, 0, 0);
  static White = new _Color(255, 255, 255, 255);
  static Black = new _Color(0, 0, 0, 255);
  static Grey = new _Color(127, 127, 127, 255);
  static DarkGrey = new _Color(100, 100, 100, 255);
  static Red = new _Color(255, 0, 0, 255);
  static Red155 = new _Color(155, 0, 0, 255);
  static Blue = new _Color(0, 255, 0, 255);
  static Green = new _Color(0, 0, 255, 255);
  static Brown = new _Color(150, 75, 0, 255);
  static BrightYellow = new _Color(255, 234, 0, 255);
  static NotVisible = new _Color(0, 0, 0, 0.5);
  static MouseIndicator = new _Color(0, 160, 0, 0.5);
};
var color_default = Color;

// src/ui/sprites.ts
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
  get(index, backgroundColor, foregroundColor, transparentColor = color_default.Transparent) {
    const recolors = this.recolors;
    const hash = `${index},${_Sprites.colorHash(backgroundColor)},${_Sprites.colorHash(foregroundColor)}`;
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
  static colorHash(c) {
    return `${c.r},${c.g},${c.b},${c.a}`;
  }
  recolor(image, backgroundColor, foregroundColor, transparentColor) {
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
      const a = data[i + 3];
      if (a == 0) {
        data[i] = transparentColor.r;
        data[i + 1] = transparentColor.g;
        data[i + 2] = transparentColor.b;
        data[i + 3] = transparentColor.a;
      } else if (r == 255 && g == 255 && b == 255) {
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

// src/ui/ui.ts
var UI = class {
  width = 20;
  height = 20;
  spriteWidth = 32;
  spriteHeight = 32;
  spriteWidthHalf = this.spriteWidth / 2;
  spriteHeightHalf = this.spriteHeight / 2;
  ctx = null;
  sprites = null;
  running = false;
  lastTime = 0;
  fps = 0;
  tileCycleIndex = 0;
  tileCycleAcc = 0;
  tileCycleSpeed = 64;
  tileCycleMax = 60;
  mx = 0;
  my = 0;
  game = new game_default(this.width, this.height);
  world = this.game.world;
  map = this.world.map;
  async initialize(canvasId, spriteSheetUrl, spriteSheetWidth, spriteSheetHeight, originalSpriteWidth, originalSpriteHeight) {
    this.sprites = new sprites_default(originalSpriteWidth, originalSpriteHeight);
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));
    canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
  }
  start() {
    this.running = true;
    requestAnimationFrame((time) => {
      this.lastTime = time;
      this.init();
      requestAnimationFrame((time2) => this.loop(time2));
    });
  }
  stop() {
    this.running = false;
  }
  init() {
    this.game.refreshVisibility(1, 1);
  }
  loop(time) {
    if (!this.running) return;
    const delta = time - this.lastTime;
    this.lastTime = time;
    this.fps = 1e3 / delta;
    this.update(delta);
    this.draw();
    requestAnimationFrame((time2) => this.loop(time2));
  }
  // input
  handleMouseMove(event) {
    const mx = Math.floor(event.offsetX / this.spriteWidth);
    const my = Math.floor(event.offsetY / this.spriteHeight);
    this.mx = mx < 0 ? 0 : mx >= this.width ? this.width - 1 : mx;
    this.my = my < 0 ? 0 : my >= this.height ? this.height - 1 : my;
  }
  handleMouseDown(event) {
    const mx = this.mx;
    const my = this.my;
    this.game.refreshVisibility(mx, my);
  }
  // logic
  update(delta) {
    this.tileCycleAcc += delta;
    while (this.tileCycleAcc >= this.tileCycleSpeed) {
      this.tileCycleAcc -= this.tileCycleSpeed;
      this.tileCycleIndex++;
      if (this.tileCycleIndex >= this.tileCycleMax)
        this.tileCycleIndex = 0;
    }
  }
  // drawing
  draw() {
    const ctx = this.ctx;
    const mx = this.mx;
    const my = this.my;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * this.spriteWidth, this.height * this.spriteHeight);
    const tileSpriteCache = [];
    const tileBackgroundCache = [];
    const tileForegroundCache = [];
    const map = this.map;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const visible = map.isVisible(x, y);
        const tile = map.get(x, y);
        let sprite;
        let foreground;
        let background = tileBackgroundCache[tile];
        if (background) {
          sprite = tileSpriteCache[tile];
          foreground = tileForegroundCache[tile];
        } else {
          const info = this.getTileDrawingInfo(tile);
          sprite = info.sprite;
          background = info.background;
          foreground = info.foreground;
          tileSpriteCache[tile] = sprite;
          tileBackgroundCache[tile] = background;
          tileForegroundCache[tile] = foreground;
        }
        if (visible) {
          this.drawSprite(sprite, x, y, background, foreground);
        } else if (map.isExplored(x, y)) {
          this.drawSprite(sprite, x, y, background, foreground);
          this.drawRect(x, y, color_default.NotVisible);
        } else {
          this.drawRect(x, y, color_default.Black);
        }
      }
    }
    this.drawRect(mx, my, color_default.MouseIndicator);
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 100, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(fpsText, this.width * this.spriteWidth - 100 + 5, 10);
    const posText = `pos: ${this.mx}, ${this.my}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 200, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(posText, this.width * this.spriteWidth - 200 + 5, 10);
  }
  getTileDrawingInfo(tile) {
    switch (tile) {
      case tile_default.Empty:
        return { sprite: 0, background: color_default.Transparent, foreground: color_default.Transparent };
      case tile_default.Wall:
        return { sprite: 2, background: color_default.White, foreground: color_default.Black };
      case tile_default.Fire:
        return this.animatedTile([5, 6], [color_default.Transparent], [color_default.Red, color_default.Red155], 2, 2);
    }
  }
  animatedTile(sprites, backgroundColors, foregroundColors, spriteAnimationSpeed, colorAnimationSpeed) {
    const index = this.tileCycleIndex;
    const sprite = sprites[Math.floor(index / spriteAnimationSpeed) % sprites.length];
    const i = Math.floor(index / colorAnimationSpeed);
    const background = backgroundColors[i % backgroundColors.length];
    const foreground = foregroundColors[i % foregroundColors.length];
    return { sprite, background, foreground };
  }
  // drawing helpers
  drawSpriteAbsolute(index, x, y, background, foreground) {
    const image = this.sprites.get(index, background, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }
  drawSprite(index, x, y, background, foreground) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, background, foreground);
  }
  drawRect(x, y, color) {
    const ctx = this.ctx;
    ctx.fillStyle = color.toCSS();
    ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
  drawLine(x, y, tx, ty, lineWidth, color) {
    const ctx = this.ctx;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const w = this.spriteWidth;
    const wh = this.spriteWidthHalf;
    const h = this.spriteHeight;
    const hh = this.spriteHeightHalf;
    ctx.moveTo(x * w + wh, y * h + hh);
    ctx.lineTo(tx * w + wh, ty * h + hh);
    ctx.strokeStyle = color.toCSS();
    ctx.stroke();
  }
};
var ui_default = UI;

// src/index.ts
var ui = new ui_default();
ui.initialize("canvas", "images/sprites.png", 64, 64, 16, 16).then(() => ui.start()).catch((err) => console.error(err));
