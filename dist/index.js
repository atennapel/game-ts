"use strict";

// src/world/tile.ts
var Tile = /* @__PURE__ */ ((Tile2) => {
  Tile2[Tile2["Empty"] = 0] = "Empty";
  Tile2[Tile2["Wall"] = 1] = "Wall";
  Tile2[Tile2["ClosedDoor"] = 2] = "ClosedDoor";
  Tile2[Tile2["OpenDoor"] = 3] = "OpenDoor";
  Tile2[Tile2["Fire"] = 4] = "Fire";
  Tile2[Tile2["Chair"] = 5] = "Chair";
  Tile2[Tile2["Table"] = 6] = "Table";
  Tile2[Tile2["Computer"] = 7] = "Computer";
  Tile2[Tile2["LightbulbOff"] = 8] = "LightbulbOff";
  Tile2[Tile2["LightbulbOn"] = 9] = "LightbulbOn";
  Tile2[Tile2["SwitchOff"] = 10] = "SwitchOff";
  Tile2[Tile2["SwitchOn"] = 11] = "SwitchOn";
  Tile2[Tile2["GateNand"] = 12] = "GateNand";
  Tile2[Tile2["Button"] = 13] = "Button";
  return Tile2;
})(Tile || {});
((Tile2) => {
  function isBlocked(tile) {
    switch (tile) {
      case 1 /* Wall */:
        return true;
      case 2 /* ClosedDoor */:
        return true;
      case 4 /* Fire */:
        return true;
      case 6 /* Table */:
        return true;
      case 7 /* Computer */:
        return true;
      case 8 /* LightbulbOff */:
        return true;
      case 9 /* LightbulbOn */:
        return true;
      case 10 /* SwitchOff */:
        return true;
      case 11 /* SwitchOn */:
        return true;
      case 12 /* GateNand */:
        return true;
      default:
        return false;
    }
  }
  Tile2.isBlocked = isBlocked;
  function blocksView(tile) {
    return tile == 1 /* Wall */ || tile == 2 /* ClosedDoor */;
  }
  Tile2.blocksView = blocksView;
  function description(tile) {
    switch (tile) {
      case 2 /* ClosedDoor */:
        return "door (closed)";
      case 3 /* OpenDoor */:
        return "door (open)";
      case 4 /* Fire */:
        return "fire";
      case 5 /* Chair */:
        return "chair";
      case 6 /* Table */:
        return "table";
      case 7 /* Computer */:
        return "computer";
      case 8 /* LightbulbOff */:
        return "lightbulb";
      case 9 /* LightbulbOn */:
        return "lightbulb";
      case 10 /* SwitchOff */:
        return "switch";
      case 11 /* SwitchOn */:
        return "switch";
      case 12 /* GateNand */:
        return "NAND gate";
      case 13 /* Button */:
        return "button";
      default:
        return null;
    }
  }
  Tile2.description = description;
})(Tile || (Tile = {}));
var tile_default = Tile;

// src/world/actions/action.ts
var Action = class {
  energyCost = 100;
  perform(game, actor) {
    const result = this.tryPerform(game, actor);
    if (!Array.isArray(result)) return result;
    if (result.length == 0) return false;
    actor.addActions(result);
    return false;
  }
};
var action_default = Action;

// src/world/actions/bumpaction.ts
var BumpAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    return true;
  }
};
var bumpaction_default = BumpAction;

// src/world/actions/stepaction.ts
var StepAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const world = game.world;
    const map = world.map;
    const { x, y } = this.position;
    const { x: ax, y: ay } = actor;
    if (map.isBlocked(x, y)) return false;
    if (world.actorAt(x, y)) return false;
    if (map.get(ax, ay) == tile_default.Button) world.setValue(ax, ay, 0);
    actor.x = x;
    actor.y = y;
    if (actor.isPlayer()) game.refreshVisibility();
    if (map.get(x, y) == tile_default.Button) world.setValue(x, y, 1);
    return true;
  }
};
var stepaction_default = StepAction;

// src/world/actions/moveaction.ts
var MoveAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  energyCost = 0;
  tryPerform(game, actor) {
    if (actor.x == this.position.x && actor.y == this.position.y) return false;
    const path = game.findPath(actor.x, actor.y, this.position.x, this.position.y);
    if (path) return path.map((p) => new stepaction_default(p));
    return true;
  }
};
var moveaction_default = MoveAction;

// src/world/actions/opendooraction.ts
var OpenDoorAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const { x, y } = this.position;
    const map = game.world.map;
    if (map.get(x, y) != tile_default.ClosedDoor)
      return false;
    map.set(x, y, tile_default.OpenDoor);
    game.refreshVisibility();
    return true;
  }
};
var opendooraction_default = OpenDoorAction;

// src/world/actions/useaction.ts
var UseAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const { x, y } = this.position;
    const map = game.world.map;
    const tile = map.get(x, y);
    if (tile == tile_default.Computer) {
      const value = game.world.getValue(x, y);
      game.world.setValue(x, y, value == 0 ? 1 : 0);
      return true;
    } else if (tile == tile_default.SwitchOff || tile == tile_default.SwitchOn) {
      const value = game.world.getValue(x, y);
      game.world.setValue(x, y, value == 0 ? 1 : 0);
      game.world.map.set(x, y, value == 0 ? tile_default.SwitchOn : tile_default.SwitchOff);
      return true;
    }
    return false;
  }
};
var useaction_default = UseAction;

// src/world/actions/attackaction.ts
var AttackAction = class extends action_default {
  position;
  target;
  constructor(position, target) {
    super();
    this.position = position;
    this.target = target;
  }
  tryPerform(game, actor) {
    const { x, y } = this.position;
    const target = game.world.actorAt(x, y);
    if (!target || this.target != target) return false;
    return true;
  }
};
var attackaction_default = AttackAction;

// src/world/actions/primaryaction.ts
var PrimaryAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  energyCost = 0;
  tryPerform(game, actor) {
    const { x: gx, y: gy } = this.position;
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
      return false;
    } else if (tile == tile_default.Computer || tile == tile_default.SwitchOff || tile == tile_default.SwitchOn) {
      map.set(gx, gy, tile_default.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new useaction_default(last));
        return actions;
      }
      return false;
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
      return false;
    }
    const target = game.world.actorAt(gx, gy);
    if (target) {
      const path = game.findPath(actor.x, actor.y, gx, gy);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p));
        actions.push(new attackaction_default(last, target));
        return actions;
      }
      return false;
    }
    return [new moveaction_default(this.position)];
  }
};
var primaryaction_default = PrimaryAction;

// src/world/actions/closedooraction.ts
var CloseDoorAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  tryPerform(game, actor) {
    const { x, y } = this.position;
    const map = game.world.map;
    if (map.get(x, y) != tile_default.OpenDoor)
      return false;
    map.set(x, y, tile_default.ClosedDoor);
    game.refreshVisibility();
    return true;
  }
};
var closedooraction_default = CloseDoorAction;

// src/world/actions/waitaction.ts
var WaitAction = class extends action_default {
  energyCost = 0;
  tryPerform(game, actor) {
    return true;
  }
};
var waitaction_default = WaitAction;

// src/world/actions/secondaryaction.ts
var SecondaryAction = class extends action_default {
  position;
  constructor(position) {
    super();
    this.position = position;
  }
  energyCost = 0;
  tryPerform(game, actor) {
    const { x: gx, y: gy } = this.position;
    if (gx == actor.x && gy == actor.y)
      return [new waitaction_default()];
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
    return false;
  }
};
var secondaryaction_default = SecondaryAction;

// src/world/pos.ts
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

// src/world/actors/actor.ts
var Actor = class {
  x;
  y;
  speed = 100;
  energy = 0;
  maxEnergy = 100;
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
  canTakeTurn() {
    return this.energy >= this.maxEnergy;
  }
  gainEnergy() {
    this.energy += this.speed;
    return this.canTakeTurn();
  }
  useEnergy(cost) {
    this.energy = (this.energy - cost) % this.maxEnergy;
  }
  takeTurn(game) {
    if (!this.decideNextActions(game)) return null;
    return this.actionStack.pop() || null;
  }
};
var actor_default = Actor;

// src/world/actors/npc.ts
var NPC = class extends actor_default {
  constructor(x, y) {
    super(x, y);
    this.speed = 50;
  }
  description() {
    return "npc";
  }
  isPlayer() {
    return false;
  }
  decideNextActions(game) {
    if (!this.isIdle()) return true;
    const map = game.world.map;
    const gx = Math.floor(Math.random() * map.width);
    const gy = Math.floor(Math.random() * map.height);
    this.setAction(new primaryaction_default(new pos_default(gx, gy)));
    return true;
  }
};
var npc_default = NPC;

// src/world/actors/player.ts
var Player = class extends actor_default {
  constructor(x, y) {
    super(x, y);
    this.speed = 100;
  }
  description() {
    return "player";
  }
  isPlayer() {
    return true;
  }
  decideNextActions(game) {
    return true;
  }
};
var player_default = Player;

// src/world/map.ts
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

// src/world/world.ts
var World = class {
  map;
  player;
  actors = [];
  values = /* @__PURE__ */ new Map();
  wiresOutgoing = /* @__PURE__ */ new Map();
  wiresIncoming = /* @__PURE__ */ new Map();
  valuePropogationStack = [];
  constructor(width, height) {
    this.map = new map_default(width, height);
    this.player = new player_default(1, 1);
    this.actors.push(this.player);
    this.actors.push(new npc_default(2, 2));
    this.actors.push(new npc_default(3, 3));
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
    this.map.set(8, 4, tile_default.Fire);
    this.map.set(7, 9, tile_default.Chair);
    this.map.set(8, 9, tile_default.Table);
    this.map.set(9, 9, tile_default.Chair);
    this.map.set(9, 7, tile_default.Computer);
    this.map.set(7, 7, tile_default.LightbulbOff);
    this.map.set(3, 14, tile_default.SwitchOff);
    this.map.set(3, 16, tile_default.SwitchOn);
    this.map.set(6, 15, tile_default.GateNand);
    this.map.set(9, 15, tile_default.LightbulbOff);
    this.map.set(3, 12, tile_default.Button);
    this.map.set(5, 12, tile_default.LightbulbOff);
    this.addWire(9, 7, 7, 7);
    this.addWire(3, 14, 6, 15);
    this.addWire(3, 16, 6, 15);
    this.addWire(6, 15, 9, 15);
    this.addWire(3, 12, 5, 12);
    this.setValue(3, 14, 0);
    this.setValue(3, 16, 0);
    this.setValue(3, 12, 0);
    this.setValue(5, 12, 0);
    this.propogateValues(1e4);
  }
  hasValue(x, y) {
    return this.values.has(`${x},${y}`);
  }
  getValue(x, y) {
    return this.values.get(`${x},${y}`) || 0;
  }
  setValue(x, y, value) {
    this.values.set(`${x},${y}`, value);
    for (const target of this.getOutgoingWires(x, y)) this.updateValueAt(target);
  }
  update() {
    this.propogateValues();
  }
  propogateValues(limit = 100) {
    let stack = this.valuePropogationStack;
    let loops = 0;
    while (stack.length > 0 && loops++ < limit) {
      const { x, y } = stack.pop();
      const tile = this.map.get(x, y);
      if (tile == tile_default.GateNand) {
        let anyZero = false;
        for (const source of this.getIncomingWires(x, y)) {
          if (this.getValue(source.x, source.y) == 0) {
            anyZero = true;
            break;
          }
        }
        stack = this.propogate(stack, x, y, anyZero ? 1 : 0) || stack;
      } else if (tile == tile_default.LightbulbOn || tile == tile_default.LightbulbOff) {
        let atleastOne = false;
        for (const source of this.getIncomingWires(x, y)) {
          if (this.getValue(source.x, source.y) != 0) {
            atleastOne = true;
            break;
          }
        }
        const newValue = atleastOne ? 1 : 0;
        const newstack = this.propogate(stack, x, y, newValue);
        stack = newstack || stack;
        if (newstack) this.map.set(x, y, newValue ? tile_default.LightbulbOn : tile_default.LightbulbOff);
      }
    }
    this.valuePropogationStack = stack;
  }
  propogate(stack, x, y, newValue) {
    if (newValue != this.getValue(x, y)) {
      this.setValue(x, y, newValue);
      const outgoing = this.getOutgoingWires(x, y);
      return outgoing.length > 0 ? outgoing.concat(stack) : stack;
    }
    return null;
  }
  updateValueAt(pos) {
    this.valuePropogationStack = [pos].concat(this.valuePropogationStack);
  }
  getOutgoingWires(x, y) {
    return this.wiresOutgoing.get(`${x},${y}`) || [];
  }
  getIncomingWires(x, y) {
    return this.wiresIncoming.get(`${x},${y}`) || [];
  }
  addWire(x, y, tx, ty) {
    const outgoing = this.getOutgoingWires(x, y);
    for (const wire of outgoing) {
      if (wire.x == tx && wire.y == ty)
        return;
    }
    const incoming = this.getIncomingWires(tx, ty);
    const target = new pos_default(tx, ty);
    outgoing.push(target);
    incoming.push(new pos_default(x, y));
    this.wiresOutgoing.set(`${x},${y}`, outgoing);
    this.wiresIncoming.set(`${tx},${ty}`, incoming);
    this.updateValueAt(target);
  }
  removeWire(x, y, tx, ty) {
    const outgoing = this.getOutgoingWires(x, y);
    const incoming = this.getIncomingWires(tx, ty);
    for (let i = 0; i < outgoing.length; i++) {
      const wire = outgoing[i];
      if (wire.x == tx && wire.y == ty) {
        outgoing.splice(i, 1);
        break;
      }
    }
    for (let i = 0; i < incoming.length; i++) {
      const wire = incoming[i];
      if (wire.x == x && wire.y == y) {
        outgoing.splice(i, 1);
        break;
      }
    }
    this.updateValueAt(new pos_default(tx, ty));
  }
  actorAt(x, y) {
    for (const actor of this.actors) {
      if (actor.x == x && actor.y == y)
        return actor;
    }
    return null;
  }
};
var world_default = World;

// src/logic/turnresult.ts
var TurnResult = class {
  actorIndex;
  action;
  constructor(actorIndex, action) {
    this.actorIndex = actorIndex;
    this.action = action;
  }
};
var turnresult_default = TurnResult;

// src/logic/game.ts
var Game = class {
  world;
  pathfinding;
  shadowcasting;
  actorIndex = 0;
  turns = 0;
  playerTurns = 0;
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
  currentActorIndex() {
    return this.actorIndex;
  }
  advanceActor() {
    this.actorIndex = (this.actorIndex + 1) % this.world.actors.length;
  }
  update() {
    this.world.update();
  }
  takeTurn() {
    const actors = this.world.actors;
    if (actors.length == 0) return null;
    const actorIndex = this.actorIndex;
    const actor = actors[actorIndex];
    if (actor.canTakeTurn() || actor.gainEnergy()) {
      const action = actor.takeTurn(this);
      if (!action) {
        if (actor.isPlayer()) return null;
        this.advanceActor();
        return null;
      } else {
        const succeeded = this.performAction(actor, action);
        if (!succeeded) return null;
        return new turnresult_default(actorIndex, action);
      }
    } else {
      this.advanceActor();
      return null;
    }
  }
  performAction(actor, action) {
    const succeeded = action.perform(this, actor);
    if (succeeded) {
      actor.useEnergy(action.energyCost);
      this.advanceActor();
      this.turns++;
      if (actor.isPlayer()) this.playerTurns++;
    }
    return succeeded;
  }
};
var game_default = Game;

// src/graphics/graphicsactor.ts
var GraphicsActor = class {
  actor;
  absoluteX;
  absoluteY;
  goalX;
  goalY;
  spriteWidth;
  spriteHeight;
  moving = false;
  bumping = false;
  animationSpeed = 0.25;
  bumpRatio = 0.25;
  spriteCycleSpeed = 100;
  sprites;
  colors;
  cycles;
  spriteIndex = 0;
  spriteCycleAcc = 0;
  constructor(actor, spriteWidth, spriteHeight, sprites, colors) {
    this.actor = actor;
    this.absoluteX = actor.x * spriteWidth;
    this.absoluteY = actor.y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprites = sprites;
    this.colors = colors;
    this.cycles = Math.max(sprites.length, colors.length);
  }
  get x() {
    return this.actor.x;
  }
  get y() {
    return this.actor.y;
  }
  get sprite() {
    return this.sprites[this.spriteIndex % this.sprites.length];
  }
  get color() {
    return this.colors[this.spriteIndex % this.colors.length];
  }
  isPlayer() {
    return this.actor.isPlayer();
  }
  isMoving() {
    return this.moving;
  }
  move(x, y) {
    this.moving = true;
    this.goalX = x * this.spriteWidth;
    this.goalY = y * this.spriteHeight;
  }
  bump(x, y) {
    this.moving = true;
    this.bumping = true;
    const dx = x - this.actor.x;
    const dy = y - this.actor.y;
    this.goalX = this.absoluteX + dx * this.spriteWidth * this.bumpRatio;
    this.goalY = this.absoluteY + dy * this.spriteHeight * this.bumpRatio;
  }
  animate(action) {
    if (action instanceof bumpaction_default)
      this.bump(action.position.x, action.position.y);
    else if (action instanceof closedooraction_default)
      this.bump(action.position.x, action.position.y);
    else if (action instanceof opendooraction_default)
      this.bump(action.position.x, action.position.y);
    else if (action instanceof useaction_default)
      this.bump(action.position.x, action.position.y);
    else if (action instanceof attackaction_default)
      this.bump(action.position.x, action.position.y);
    else if (action instanceof stepaction_default)
      this.move(action.position.x, action.position.y);
  }
  updateAnimation(delta) {
    this.spriteCycleAcc += delta;
    while (this.spriteCycleAcc >= this.spriteCycleSpeed) {
      this.spriteCycleAcc -= this.spriteCycleSpeed;
      this.spriteIndex++;
      if (this.spriteIndex >= this.cycles)
        this.spriteIndex = 0;
    }
    if (!this.moving) return;
    let gx = this.goalX;
    let gy = this.goalY;
    let ax = this.absoluteX;
    let ay = this.absoluteY;
    if (gx == ax && gy == ay) {
      if (this.bumping) {
        this.bumping = false;
        gx = this.actor.x * this.spriteWidth;
        gy = this.actor.y * this.spriteHeight;
      } else {
        this.moving = false;
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
};
var graphicsactor_default = GraphicsActor;

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
  static Transparent = new _Color(0, 0, 0, 0);
  static White = new _Color(255, 255, 255, 255);
  static Black = new _Color(0, 0, 0, 255);
  static Grey = new _Color(127, 127, 127, 255);
  static DarkGrey = new _Color(100, 100, 100, 255);
  static Red = new _Color(255, 0, 0, 255);
  static Blue = new _Color(0, 255, 0, 255);
  static Green = new _Color(0, 0, 255, 255);
  static Brown = new _Color(150, 75, 0, 255);
  static BrightYellow = new _Color(255, 234, 0, 255);
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

// src/graphics/tiles/graphicstile.ts
var GraphicsTile = class {
};
var graphicstile_default = GraphicsTile;

// src/graphics/tiles/animatedtile.ts
var AnimatedTile = class extends graphicstile_default {
  sprites;
  background;
  foreground;
  spriteAnimationSpeed;
  colorAnimationSpeed;
  constructor(sprites, background, foreground, spriteAnimationSpeed, colorAnimationSpeed) {
    super();
    this.sprites = sprites;
    this.background = background;
    this.foreground = foreground;
    this.spriteAnimationSpeed = spriteAnimationSpeed;
    this.colorAnimationSpeed = colorAnimationSpeed;
  }
  sprite(world, index) {
    return this.sprites[Math.floor(index / this.spriteAnimationSpeed) % this.sprites.length];
  }
  color(world, index, background) {
    const i = Math.floor(index / this.colorAnimationSpeed);
    return background ? this.background[i % this.background.length] : this.foreground[i % this.foreground.length];
  }
};
var animatedtile_default = AnimatedTile;

// src/graphics/tiles/statictile.ts
var StaticTile = class extends graphicstile_default {
  mySprite;
  background;
  foreground;
  constructor(sprite, background, foreground) {
    super();
    this.mySprite = sprite;
    this.background = background;
    this.foreground = foreground;
  }
  sprite(world, index) {
    return this.mySprite;
  }
  color(world, index, background) {
    return background ? this.background : this.foreground;
  }
};
var statictile_default = StaticTile;

// src/graphics/tiles/graphicstiles.ts
var tiles = [
  // Empty
  new statictile_default(0, color_default.Transparent, color_default.Transparent),
  // Wall
  new statictile_default(2, color_default.Transparent, color_default.Black),
  // ClosedDoor
  new statictile_default(3, color_default.Transparent, color_default.Black),
  // OpenDoor
  new statictile_default(4, color_default.Transparent, color_default.Black),
  // Fire
  new animatedtile_default([5, 6], [color_default.Transparent], [color_default.Red, new color_default(155, 0, 0, 255)], 2, 2),
  // Chair
  new statictile_default(7, color_default.Transparent, color_default.Brown),
  // Table
  new statictile_default(8, color_default.Transparent, color_default.Brown),
  // Computer
  new animatedtile_default([9, 10], [color_default.White], [color_default.DarkGrey], 4, 4),
  // LightbulbOff
  new statictile_default(11, color_default.Transparent, color_default.DarkGrey),
  // LightbulbOn
  new statictile_default(11, color_default.Transparent, color_default.BrightYellow),
  // SwitchOff
  new statictile_default(13, color_default.Transparent, color_default.DarkGrey),
  // SwitchOn
  new statictile_default(14, color_default.Transparent, color_default.DarkGrey),
  // GateNand
  new statictile_default(12, color_default.White, color_default.DarkGrey),
  // Button
  new statictile_default(15, color_default.Transparent, color_default.DarkGrey)
];
var graphicstiles_default = tiles;

// src/graphics/main.ts
var Main = class {
  width = 20;
  height = 20;
  spriteWidth = 32;
  spriteHeight = 32;
  spriteWidthHalf = this.spriteWidth / 2;
  spriteHeightHalf = this.spriteHeight / 2;
  game = new game_default(this.width, this.height);
  world = this.game.world;
  map = this.world.map;
  actors = this.world.actors.map((e) => this.createGraphicsActor(e));
  mx = 0;
  my = 0;
  gx = 0;
  gy = 0;
  ctx = null;
  sprites = null;
  running = false;
  lastTime = 0;
  fps = 0;
  tileCycleIndex = 0;
  tileCycleAcc = 0;
  tileCycleSpeed = 64;
  tileCycleMax = 60;
  waitingOnAnimations = false;
  pendingAnimations = [];
  createGraphicsActor(entity) {
    if (entity.isPlayer())
      return new graphicsactor_default(entity, this.spriteWidth, this.spriteHeight, [1], [color_default.Black]);
    return new graphicsactor_default(entity, this.spriteWidth, this.spriteHeight, [1], [color_default.Red]);
  }
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
      this.world.player.setAction(new secondaryaction_default(new pos_default(mx, my)));
    } else if (event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.world.player.setAction(new primaryaction_default(new pos_default(mx, my)));
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
    this.fps = 1e3 / delta;
    this.logic(delta);
    this.draw();
    requestAnimationFrame((time2) => this.loop(time2));
  }
  startPendingAnimations() {
    const nextPendingAnimations = [];
    for (const animation of this.pendingAnimations) {
      const actor = animation.actor;
      if (actor.isMoving())
        nextPendingAnimations.push(animation);
      else
        actor.animate(animation.action);
    }
    this.pendingAnimations = nextPendingAnimations;
  }
  anyActorsMoving() {
    for (const actor of this.actors) {
      if (actor.isMoving())
        return true;
    }
    return false;
  }
  logic(delta) {
    this.game.update();
    if (this.waitingOnAnimations) {
      this.startPendingAnimations();
      if (this.pendingAnimations.length == 0 && !this.anyActorsMoving())
        this.waitingOnAnimations = false;
    } else {
      const result = this.game.takeTurn();
      if (result) {
        const actor = this.actors[result.actorIndex];
        this.pendingAnimations.push({ actor, action: result.action });
        if (actor.isPlayer()) this.waitingOnAnimations = true;
      }
    }
    this.tileCycleAcc += delta;
    while (this.tileCycleAcc >= this.tileCycleSpeed) {
      this.tileCycleAcc -= this.tileCycleSpeed;
      this.tileCycleIndex++;
      if (this.tileCycleIndex >= this.tileCycleMax)
        this.tileCycleIndex = 0;
    }
    for (const actor of this.actors) actor.updateAnimation(delta);
  }
  draw() {
    const ctx = this.ctx;
    const mx = this.mx;
    const my = this.my;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * this.spriteWidth, this.height * this.spriteHeight);
    const tileSpriteCache = [];
    const tileBackgroundCache = [];
    const tileForegroundCache = [];
    const index = this.tileCycleIndex;
    const map = this.map;
    const world = this.world;
    for (let x = 0; x < this.width; x++) {
      for (let y = 0; y < this.height; y++) {
        const visible = map.isVisible(x, y);
        const tile = map.get(x, y);
        let sprite;
        let foreground;
        let background = tileBackgroundCache[tile];
        if (tileBackgroundCache[tile]) {
          sprite = tileSpriteCache[tile];
          foreground = tileForegroundCache[tile];
        } else {
          const graphicstile = graphicstiles_default[tile];
          sprite = graphicstile.sprite(world, index);
          background = graphicstile.color(world, index, true);
          foreground = graphicstile.color(world, index, false);
          tileSpriteCache[tile] = sprite;
          tileBackgroundCache[tile] = background;
          tileForegroundCache[tile] = foreground;
        }
        if (visible) {
          this.drawSprite(sprite, x, y, foreground, background);
        } else if (map.isExplored(x, y)) {
          this.drawSprite(sprite, x, y, foreground, background);
          this.drawRect(x, y, "rgba(0, 0, 0, 0.5)");
        } else {
          this.drawRect(x, y, "black");
        }
      }
    }
    for (const actor of this.actors) {
      if (actor.isPlayer() || this.map.isVisible(actor.x, actor.y))
        this.drawEntity(actor);
    }
    if (!this.world.player.isIdle())
      this.drawRect(this.gx, this.gy, "rgba(0, 0, 160, 0.5)");
    this.drawRect(mx, my, "rgba(0, 160, 0, 0.5)");
    const wireStyle = this.world.getValue(mx, my) == 0 ? "darkred" : "darkgreen";
    for (const target of this.world.getOutgoingWires(mx, my))
      this.drawLine(mx, my, target.x, target.y, 2, wireStyle);
    for (const source of this.world.getIncomingWires(mx, my)) {
      const { x: sx, y: sy } = source;
      const isOff = this.world.getValue(sx, sy) == 0;
      this.drawLine(sx, sy, mx, my, 2, isOff ? "red" : "green");
    }
    const tileActor = this.world.actorAt(mx, my);
    let tileText = null;
    if (tileActor)
      tileText = tileActor.description();
    else {
      const tileDescription = tile_default.description(this.map.get(mx, my));
      if (tileDescription)
        tileText = this.world.hasValue(mx, my) ? `${tileDescription} (${this.world.getValue(mx, my)})` : tileDescription;
    }
    if (tileText) {
      ctx.font = "12px monospace";
      ctx.fillStyle = "white";
      ctx.fillRect(0, 0, tileText.length * 8 + 5, 16);
      ctx.fillStyle = "black";
      ctx.fillText(tileText, 5, 10);
    }
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
    const turnsText = `turns: ${this.game.turns} | ${this.game.playerTurns}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 300, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(turnsText, this.width * this.spriteWidth - 300 + 5, 10);
    const debugText = `debug: ${this.pendingAnimations.length}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * this.spriteWidth - 400, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(debugText, this.width * this.spriteWidth - 400 + 5, 10);
  }
  drawRect(x, y, style) {
    const ctx = this.ctx;
    ctx.fillStyle = style;
    ctx.fillRect(x * this.spriteWidth, y * this.spriteHeight, this.spriteWidth, this.spriteHeight);
  }
  drawSpriteAbsolute(index, x, y, foreground, background = color_default.White) {
    const image = this.sprites.get(index, background, foreground);
    if (image) this.ctx.drawImage(image, x, y, this.spriteWidth, this.spriteHeight);
  }
  drawSprite(index, x, y, foreground, background = color_default.White) {
    this.drawSpriteAbsolute(index, x * this.spriteWidth, y * this.spriteHeight, foreground, background);
  }
  drawEntity(entity) {
    this.drawSpriteAbsolute(entity.sprite, entity.absoluteX, entity.absoluteY, entity.color, color_default.Transparent);
  }
  drawLine(x, y, tx, ty, lineWidth, style) {
    const ctx = this.ctx;
    ctx.lineWidth = lineWidth;
    ctx.beginPath();
    const w = this.spriteWidth;
    const wh = this.spriteWidthHalf;
    const h = this.spriteHeight;
    const hh = this.spriteHeightHalf;
    ctx.moveTo(x * w + wh, y * h + hh);
    ctx.lineTo(tx * w + wh, ty * h + hh);
    ctx.strokeStyle = style;
    ctx.stroke();
  }
};
var main_default = Main;

// src/index.ts
var main = new main_default();
main.initialize("canvas", "images/sprites.bmp", 64, 64, 16, 16).then(() => main.start()).catch((err) => console.error(err));
