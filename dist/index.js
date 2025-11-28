"use strict";

// src/logic/tile.ts
var Tile = /* @__PURE__ */ ((Tile2) => {
  Tile2[Tile2["Empty"] = 0] = "Empty";
  Tile2[Tile2["Wall"] = 1] = "Wall";
  Tile2[Tile2["ClosedDoor"] = 2] = "ClosedDoor";
  Tile2[Tile2["OpenDoor"] = 3] = "OpenDoor";
  return Tile2;
})(Tile || {});
((Tile2) => {
  function isBlocked(tile) {
    return tile == 1 /* Wall */ || tile == 2 /* ClosedDoor */;
  }
  Tile2.isBlocked = isBlocked;
  function description(tile) {
    if (tile == 2 /* ClosedDoor */) return "door (closed)";
    else if (tile == 3 /* OpenDoor */) return "door (open)";
    return null;
  }
  Tile2.description = description;
})(Tile || (Tile = {}));
var tile_default = Tile;

// src/logic/actions/action.ts
var Action = class {
  perform(game, actor) {
    let action = this;
    while (true) {
      const result = action.tryPerform(game, actor);
      if (!result || result.length == 0) break;
      action = result.shift();
      actor.addActions(result);
    }
  }
};
var action_default = Action;

// src/logic/actions/bumpaction.ts
var BumpAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    actor.bump(this.position.x, this.position.y);
    return null;
  }
};
var bumpaction_default = BumpAction;

// src/logic/actions/stepaction.ts
var StepAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const x = this.position.x;
    const y = this.position.y;
    if (game.world.map.isBlocked(x, y))
      return null;
    actor.move(x, y);
    if (actor.isPlayer()) game.refreshVisibility();
    return null;
  }
};
var stepaction_default = StepAction;

// src/logic/actions/moveaction.ts
var MoveAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const path = game.findPath(actor.x, actor.y, this.position.x, this.position.y);
    if (path) return path.map((p) => new stepaction_default(p));
    return null;
  }
};
var moveaction_default = MoveAction;

// src/logic/actions/opendooraction.ts
var OpenDoorAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const x = this.position.x;
    const y = this.position.y;
    const map = game.world.map;
    if (map.get(x, y) != tile_default.ClosedDoor)
      return null;
    actor.bump(x, y);
    map.set(x, y, tile_default.OpenDoor);
    game.refreshVisibility();
    return null;
  }
};
var opendooraction_default = OpenDoorAction;

// src/logic/actions/primaryaction.ts
var PrimaryAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const gx = this.position.x;
    const gy = this.position.y;
    const map = game.world.map;
    const tile = map.get(gx, gy);
    if (tile == tile_default.ClosedDoor) {
      map.set(gx, gy, tile_default.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new opendooraction_default(last));
        actions.push(new stepaction_default(last));
        return actions;
      }
      return null;
    } else if (tile_default.isBlocked(tile)) {
      map.set(gx, gy, tile_default.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new bumpaction_default(last));
        return actions;
      }
      return null;
    }
    return [new moveaction_default(this.position)];
  }
};
var primaryaction_default = PrimaryAction;

// src/logic/actions/closedooraction.ts
var CloseDoorAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const x = this.position.x;
    const y = this.position.y;
    const map = game.world.map;
    if (map.get(x, y) != tile_default.OpenDoor)
      return null;
    actor.bump(x, y);
    map.set(x, y, tile_default.ClosedDoor);
    game.refreshVisibility();
    return null;
  }
};
var closedooraction_default = CloseDoorAction;

// src/logic/actions/secondaryaction.ts
var SecondaryAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const gx = this.position.x;
    const gy = this.position.y;
    const map = game.world.map;
    const tile = map.get(gx, gy);
    if (tile == tile_default.ClosedDoor) {
      map.set(gx, gy, tile_default.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new opendooraction_default(last));
        return actions;
      }
    } else if (tile == tile_default.OpenDoor) {
      const path = game.findPath(actor.x, actor.y, gx, gy);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new closedooraction_default(last));
        return actions;
      }
    }
    return null;
  }
};
var secondaryaction_default = SecondaryAction;

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

// src/logic/entities/entity.ts
var Entity = class {
  x;
  y;
  actionStack = [];
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
  resetActions() {
    this.actionStack = [];
  }
  isIdle() {
    return this.actionStack.length == 0;
  }
  addActions(actions) {
    for (let i = actions.length - 1; i >= 0; i--)
      this.actionStack.push(actions[i]);
  }
  setAction(action) {
    this.actionStack = [action];
  }
  takeTurn(game, actor) {
    this.decideNextAction(game);
    const action = this.actionStack.pop() || null;
    if (action) {
      action.perform(game, actor);
      return true;
    } else return false;
  }
};
var entity_default = Entity;

// src/logic/entities/npc.ts
var NPC = class extends entity_default {
  isPlayer() {
    return false;
  }
  decideNextAction(game) {
    if (!this.isIdle()) return;
    const map = game.world.map;
    const gx = Math.floor(Math.random() * map.width);
    const gy = Math.floor(Math.random() * map.height);
    this.setAction(new primaryaction_default(new pos_default(gx, gy)));
  }
};
var npc_default = NPC;

// src/logic/entities/player.ts
var Player = class extends entity_default {
  isPlayer() {
    return true;
  }
  decideNextAction(game) {
  }
};
var player_default = Player;

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

// src/logic/world.ts
var World = class {
  map;
  player;
  npc;
  constructor(width, height) {
    this.map = new map_default(width, height);
    this.player = new player_default(1, 1);
    this.npc = new npc_default(2, 2);
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
          this.map.set(x, y, tile_default.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, tile_default.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, tile_default.Empty);
        if (x == 8 && y == 6)
          this.map.set(x, y, tile_default.ClosedDoor);
      }
    }
  }
};
var world_default = World;

// src/logic/game.ts
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
  refreshVisibility() {
    const player = this.world.player;
    this.shadowcasting.refreshVisibility(player.x, player.y);
  }
};
var game_default = Game;

// src/graphics/animatedentity.ts
var AnimatedEntity = class {
  entity;
  absoluteX;
  absoluteY;
  goalX;
  goalY;
  spriteWidth;
  spriteHeight;
  animating = false;
  bumping = false;
  animationSpeed = 0.25;
  bumpRatio = 0.25;
  sprite;
  color;
  constructor(entity, spriteWidth, spriteHeight, sprite, color) {
    this.entity = entity;
    this.absoluteX = entity.x * spriteWidth;
    this.absoluteY = entity.y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprite = sprite;
    this.color = color;
  }
  get x() {
    return this.entity.x;
  }
  get y() {
    return this.entity.y;
  }
  isPlayer() {
    return this.entity.isPlayer();
  }
  isAnimating() {
    return this.animating;
  }
  move(x, y) {
    this.animating = true;
    this.goalX = x * this.spriteWidth;
    this.goalY = y * this.spriteHeight;
  }
  bump(x, y) {
    this.animating = true;
    this.bumping = true;
    const dx = x - this.entity.x;
    const dy = y - this.entity.y;
    this.goalX = this.absoluteX + dx * this.spriteWidth * this.bumpRatio;
    this.goalY = this.absoluteY + dy * this.spriteHeight * this.bumpRatio;
  }
  update(game, delta) {
    if (!this.animating && !this.entity.takeTurn(game, this)) return;
    let gx = this.goalX;
    let gy = this.goalY;
    let ax = this.absoluteX;
    let ay = this.absoluteY;
    if (gx == ax && gy == ay) {
      if (this.bumping) {
        this.bumping = false;
        gx = this.entity.x * this.spriteWidth;
        gy = this.entity.y * this.spriteHeight;
      } else {
        this.animating = false;
        this.entity.x = Math.floor(gx / this.spriteWidth);
        this.entity.y = Math.floor(gy / this.spriteHeight);
        return;
      }
    }
    let change = delta * this.animationSpeed;
    if ((ax < gx || ax > gx) && (ay < gy || ay > gy))
      change *= Math.SQRT1_2;
    if (ax < gx) {
      ax += change;
      if (ax > gx) ax = gx;
    } else if (ax > gx) {
      ax -= change;
      if (ax < gx) ax = gx;
    }
    if (ay < gy) {
      ay += change;
      if (ay > gy) ay = gy;
    } else if (ay > gy) {
      ay -= change;
      if (ay < gy) ay = gy;
    }
    this.goalX = gx;
    this.goalY = gy;
    this.absoluteX = ax;
    this.absoluteY = ay;
  }
  resetActions() {
    this.entity.resetActions();
  }
  addActions(actions) {
    this.entity.addActions(actions);
  }
  setAction(action) {
    this.entity.setAction(action);
  }
  isIdle() {
    return this.entity.isIdle();
  }
};
var animatedentity_default = AnimatedEntity;

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
  width = 20;
  height = 20;
  originalSpriteWidth = 16;
  originalSpriteHeight = 16;
  spriteWidth = 32;
  spriteHeight = 32;
  game = new game_default(this.width, this.height);
  world = this.game.world;
  map = this.world.map;
  player = new animatedentity_default(this.world.player, this.spriteWidth, this.spriteHeight, 0, color_default.Black);
  monster = new animatedentity_default(this.world.npc, this.spriteWidth, this.spriteHeight, 0, color_default.Red);
  mx = 0;
  my = 0;
  gx = 0;
  gy = 0;
  ctx = null;
  sprites = new sprites_default(this.originalSpriteWidth, this.originalSpriteHeight);
  running = false;
  lastTime = 0;
  async initialize(canvasId, spriteSheetUrl, spriteSheetWidth, spriteSheetHeight) {
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
      this.initLoop();
      requestAnimationFrame((time2) => this.loop(time2));
    });
  }
  stop() {
    this.running = false;
  }
  handleMouseMove(event) {
    const mx = Math.floor(event.offsetX / this.spriteWidth);
    const my = Math.floor(event.offsetY / this.spriteHeight);
    this.mx = mx < 0 ? 0 : mx >= this.width ? this.width - 1 : mx;
    this.my = my < 0 ? 0 : my >= this.height ? this.height - 1 : my;
  }
  handleMouseDown(event) {
    const mx = this.mx;
    const my = this.my;
    if (!this.map.isExplored(mx, my)) return;
    if (event.buttons == 4 || event.ctrlKey && event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.player.setAction(new secondaryaction_default(new pos_default(mx, my)));
    } else if (event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.player.setAction(new primaryaction_default(new pos_default(mx, my)));
    }
  }
  initLoop() {
    this.game.refreshVisibility();
    this.draw();
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
    this.player.update(this.game, delta);
    this.monster.update(this.game, delta);
  }
  draw() {
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        this.drawTile(x, y);
      }
    }
    if (this.map.isVisible(this.monster.x, this.monster.y))
      this.drawEntity(this.monster);
    this.drawEntity(this.player);
    if (!this.player.isIdle())
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");
    this.drawRect(this.mx, this.my, "rgba(0, 160, 0, 0.5)");
    const tileText = tile_default.description(this.map.get(this.mx, this.my));
    if (tileText) {
      this.ctx.font = "12px monospace";
      this.ctx.fillStyle = "white";
      this.ctx.fillRect(0, 0, tileText.length * 8, 16);
      this.ctx.fillStyle = "black";
      this.ctx.fillText(tileText, 5, 10);
    }
  }
  drawTile(x, y) {
    const map = this.map;
    const visible = map.isVisible(x, y);
    const tile = map.get(x, y);
    if (visible) {
      if (tile == tile_default.Wall)
        this.drawSprite(1, x, y, color_default.Black);
      else if (tile == tile_default.ClosedDoor)
        this.drawSprite(2, x, y, color_default.Black);
      else if (tile == tile_default.OpenDoor)
        this.drawSprite(3, x, y, color_default.Black);
      else
        this.drawRect(x, y, "white");
    } else {
      if (map.isExplored(x, y)) {
        if (tile == tile_default.Wall)
          this.drawSprite(1, x, y, color_default.Grey);
        else if (tile == tile_default.ClosedDoor)
          this.drawSprite(2, x, y, color_default.Grey);
        else if (tile == tile_default.OpenDoor)
          this.drawSprite(3, x, y, color_default.Grey);
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
  drawSpriteAbsolute(index, x, y, foreground, background = color_default.White) {
    const image = this.sprites.get(index, background, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }
  drawSprite(index, x, y, foreground) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground);
  }
  drawEntity(entity) {
    this.drawSpriteAbsolute(entity.sprite, entity.absoluteX, entity.absoluteY, entity.color, color_default.Transparent);
  }
};
var main_default = Main;

// src/index.ts
var main = new main_default();
main.initialize("canvas", "images/sprites.bmp", 32, 32).then(() => main.start()).catch((err) => console.error(err));
