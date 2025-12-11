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

// src/game/world/actions/action.ts
var Action = class {
};
var action_default = Action;

// src/game/world/actions/stepaction.ts
var StepAction = class extends action_default {
  x;
  y;
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
  perform(game, actor) {
    const world = game.world;
    const map = world.map;
    const { x, y } = this;
    if (actor.x == x && actor.y == y) return true;
    if (map.isBlocked(x, y)) return false;
    if (world.actorAt(x, y)) return false;
    actor.x = x;
    actor.y = y;
    if (actor.isPlayer()) game.refreshVisibility();
    return true;
  }
};
var stepaction_default = StepAction;

// src/game/world/actions/moveaction.ts
var MoveAction = class extends action_default {
  x;
  y;
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
  perform(game, actor) {
    const { x, y } = actor;
    const { x: gx, y: gy } = this;
    if (x == gx && y == gy) return true;
    const path = game.findPath(x, y, gx, gy);
    if (path) return path.map((p) => new stepaction_default(p.x, p.y));
    return true;
  }
};
var moveaction_default = MoveAction;

// src/game/world/brains/brain.ts
var Brain = class {
};
var brain_default = Brain;

// src/game/world/brains/kanrenbrain.ts
var Stream = class {
  static empty;
  static singleton(value) {
    return new Ext(value, this.empty);
  }
};
var Empty = class extends Stream {
  map(f) {
    return this;
  }
  interleave(other) {
    return other;
  }
  then(k) {
    return this;
  }
  take(n, result = []) {
    return result;
  }
  takeWhile(f, result = []) {
    return result;
  }
};
Stream.empty = new Empty();
var Ext = class _Ext extends Stream {
  head;
  tail;
  constructor(head, tail) {
    super();
    this.head = head;
    this.tail = tail;
  }
  map(f) {
    return new _Ext(f(this.head), this.tail.map(f));
  }
  interleave(other) {
    return new _Ext(this.head, this.tail.interleave(other));
  }
  then(k) {
    return k(this.head).interleave(this.tail.then(k));
  }
  take(n, result = []) {
    if (n <= 0) return result;
    result.push(this.head);
    return this.tail.take(n - 1, result);
  }
  takeWhile(f, result = []) {
    if (!f(this.head)) return result;
    result.push(this.head);
    return this.tail.takeWhile(f, result);
  }
};
var Delay = class _Delay extends Stream {
  thunk;
  value = null;
  constructor(thunk) {
    super();
    this.thunk = thunk;
  }
  force() {
    if (!this.value) this.value = this.thunk();
    return this.value;
  }
  map(f) {
    return new _Delay(() => this.force().map(f));
  }
  interleave(other) {
    return new _Delay(() => other.interleave(this.force()));
  }
  then(k) {
    return new _Delay(() => this.force().then(k));
  }
  take(n, result) {
    return this.force().take(n, result);
  }
  takeWhile(f, result = []) {
    return this.force().takeWhile(f, result);
  }
};
var Var = class {
  id;
  constructor(id) {
    this.id = id;
  }
};
var Constraint = class {
};
var State = class _State {
  nextId;
  env;
  constraints;
  constructor(nextId, env, constraints) {
    this.nextId = nextId;
    this.env = env;
    this.constraints = constraints;
  }
  static empty = new _State(0, /* @__PURE__ */ new Map(), /* @__PURE__ */ new Map());
  newVar() {
    return [new _State(this.nextId + 1, this.env, this.constraints), new Var(this.nextId)];
  }
  withEnv(env) {
    return new _State(this.nextId, env, this.constraints);
  }
  withConstraints(v, cs) {
    const n = new Map(this.constraints);
    if (cs.length == 0) n.delete(v);
    else n.set(v, cs);
    return new _State(this.nextId, this.env, n);
  }
  withConstraint(c) {
    const env = this.env;
    const newConstraints = new Map(this.constraints);
    for (const t of c.terms) {
      for (const v of _State.vars(Goal.zonk(env, t))) {
        const a = newConstraints.get(v) || [];
        newConstraints.set(v, a.concat([c]));
      }
    }
    return new _State(this.nextId, this.env, newConstraints);
  }
  static vars(t, result = []) {
    if (t instanceof Var) {
      if (result.indexOf(t.id) >= 0) return result;
      result.push(t.id);
      return result;
    } else if (Array.isArray(t)) {
      for (const x of t) _State.vars(x, result);
      return result;
    }
    return result;
  }
};
var InequalityConstraint = class extends Constraint {
  left;
  right;
  terms;
  constructor(left, right) {
    super();
    this.left = left;
    this.right = right;
    this.terms = [left, right];
  }
};
var Goal = class _Goal {
  apply;
  constructor(cont) {
    this.apply = cont;
  }
  static delay(g) {
    return new _Goal((state) => g().apply(state));
  }
  static succeed = new _Goal((state) => Stream.singleton(state));
  static fail = new _Goal((state) => Stream.empty);
  delay() {
    return new _Goal((state) => new Delay(() => this.apply(state)));
  }
  static equals(a, b) {
    return new _Goal((state) => {
      const res = _Goal.unify(state, a, b);
      return res ? Stream.singleton(res) : Stream.empty;
    });
  }
  static notEquals(a0, b0) {
    return new _Goal((state) => {
      const a = _Goal.zonk(state.env, a0);
      const b = _Goal.zonk(state.env, b0);
      if (_Goal.ground(a) && _Goal.ground(b))
        return _Goal.groundEquals(a, b) ? Stream.empty : Stream.singleton(state);
      return Stream.singleton(state.withConstraint(new InequalityConstraint(a, b)));
    });
  }
  static groundEquals(a, b) {
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false;
      const l = a.length;
      if (b.length != l) return false;
      for (let i = 0; i < l; i++) if (!_Goal.groundEquals(a[i], b[i])) return false;
      return true;
    }
    return a === b;
  }
  static exists(k) {
    return new _Goal((state) => {
      const [newState, newVar] = state.newVar();
      return k(newVar).apply(newState);
    });
  }
  static exists2(k) {
    return _Goal.exists((v1) => _Goal.exists((v2) => k(v1, v2)));
  }
  or(b) {
    return new _Goal((state) => this.apply(state).interleave(b.apply(state)));
  }
  and(b) {
    return new _Goal((state) => this.apply(state).then(b.apply));
  }
  static any(x, options) {
    let cur = _Goal.fail;
    for (const v of options)
      cur = cur.or(_Goal.equals(x, v)).delay();
    return cur;
  }
  static all(x, options) {
    let cur = _Goal.succeed;
    for (const v of options)
      cur = cur.and(_Goal.equals(x, v)).delay();
    return cur;
  }
  static natural(x, n = 0) {
    return _Goal.equals(x, n).or(_Goal.delay(() => _Goal.natural(x, n + 1))).delay();
  }
  static range(x, a, b) {
    return a >= b ? _Goal.fail : _Goal.equals(x, a).or(_Goal.delay(() => _Goal.range(x, a + 1, b))).delay();
  }
  static run(n, goal) {
    const state = State.empty;
    const [nextState, newVar] = state.newVar();
    const states = goal(newVar).apply(nextState).take(n);
    const l = states.length;
    const result = new Array(l);
    for (let i = 0; i < l; i++) {
      const state2 = states[i];
      result[i] = _Goal.zonk(state2.env, newVar);
    }
    return result;
  }
  static runGround(n, goal) {
    const state = State.empty;
    const [nextState, newVar] = state.newVar();
    const result = [];
    goal(newVar).apply(nextState).takeWhile((state2) => {
      if (result.length >= n) return false;
      const value = _Goal.zonk(state2.env, newVar);
      if (!_Goal.ground(value)) return true;
      result.push(value);
      return true;
    });
    return result;
  }
  static ground(t) {
    if (t instanceof Var) return false;
    if (Array.isArray(t)) {
      for (const v of t) if (!this.ground(v)) return false;
      return true;
    }
    return true;
  }
  static zonk(env, t) {
    if (t instanceof Var) {
      if (env.has(t.id)) return _Goal.zonk(env, env.get(t.id));
      return t;
    }
    if (Array.isArray(t)) {
      const l = t.length;
      const r = new Array(l);
      for (let i = 0; i < l; i++) r[i] = _Goal.zonk(env, t[i]);
      return r;
    }
    return t;
  }
  static occurs(env, v, t0) {
    const t = _Goal.zonk(env, t0);
    if (t instanceof Var) return t.id == v;
    else if (Array.isArray(t)) {
      for (const x of t) if (_Goal.occurs(env, v, x)) return true;
      return false;
    }
    return false;
  }
  static solve(state, v, t) {
    if (_Goal.occurs(state.env, v, t)) return null;
    if (state.constraints.has(v)) {
      const newConstraints = state.constraints.get(v).map((c) => _Goal.solveConstraint(state, c));
      if (newConstraints.indexOf(2) >= 0) return null;
      return state.withConstraints(v, []).withEnv(new Map(state.env).set(v, t));
    }
    return state.withEnv(new Map(state.env).set(v, t));
  }
  static unify(state, a0, b0) {
    const a = _Goal.zonk(state.env, a0);
    const b = _Goal.zonk(state.env, b0);
    if (a instanceof Var) {
      if (b instanceof Var && (a == b || a.id == b.id)) return state;
      return _Goal.solve(state, a.id, b);
    } else if (b instanceof Var) return _Goal.solve(state, b.id, a);
    else if (Array.isArray(a) && Array.isArray(b)) {
      const l = a.length;
      if (b.length != l) return null;
      let acc = state;
      for (let i = 0; i < l; i++) {
        const res = _Goal.unify(acc, a[i], b[i]);
        if (!res) return null;
        acc = res;
      }
      return acc;
    } else if (a === b) return state;
    return null;
  }
  // 0 = unknown, 1 = succeed, 2 = fail
  static solveConstraint(state, c) {
    if (c instanceof InequalityConstraint) {
      const a = _Goal.zonk(state.env, c.left);
      const b = _Goal.zonk(state.env, c.right);
      if (_Goal.ground(a) && _Goal.ground(b))
        return _Goal.groundEquals(a, b) ? 2 : 1;
      return 0;
    }
    return -1;
  }
};
var KanrenBrain = class _KanrenBrain extends brain_default {
  decideAction(game, actor) {
    const goal = (p) => Goal.exists2((x2, y2) => Goal.notEquals(x2, actor.x).and(Goal.notEquals(y2, actor.y)).and(_KanrenBrain.position(game, x2, y2)).and(Goal.equals(p, [x2, y2])));
    const result = Goal.runGround(100, goal);
    if (result.length == 0) return null;
    const [x, y] = result[Math.floor(Math.random() * result.length)];
    return new moveaction_default(x, y);
  }
  static actor(game, x) {
    return Goal.any(x, game.world.actors.map((a) => a.id));
  }
  static myX(actor, x) {
    return Goal.equals(actor.x, x);
  }
  static myY(actor, y) {
    return Goal.equals(actor.y, y);
  }
  static myPosition(actor, x, y) {
    return _KanrenBrain.myX(actor, x).and(_KanrenBrain.myY(actor, y));
  }
  static position(game, x, y) {
    if (x instanceof Var && y instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      return Goal.range(x, 0, w).and(Goal.range(y, 0, h));
    } else if (x instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof y != "number" || y < 0 || y >= h) return Goal.fail;
      return Goal.range(x, 0, w);
    } else if (y instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof x != "number" || x < 0 || x >= w) return Goal.fail;
      return Goal.range(y, 0, h);
    } else {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof x == "number" && typeof y == "number" && x < 0 && x >= w && y < 0 && y >= h)
        return Goal.succeed;
      return Goal.fail;
    }
  }
};
var kanrenbrain_default = KanrenBrain;

// src/game/world/actors/actor.ts
var Actor = class _Actor {
  x;
  y;
  id;
  static nextId = 0;
  actionStack = [];
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.id = _Actor.nextId++;
  }
  isPlayer() {
    return false;
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
  nextAction() {
    return this.actionStack.pop() || null;
  }
};
var actor_default = Actor;

// src/game/world/actors/kanrennpc.ts
var KanrenNPC = class extends actor_default {
  brain;
  constructor(x, y) {
    super(x, y);
    this.brain = new kanrenbrain_default();
  }
  description() {
    return "kanrennpc";
  }
  decideAction(game) {
    if (this.isIdle()) {
      const action = this.brain.decideAction(game, this);
      if (action) this.setAction(action);
    }
    return this.nextAction();
  }
};
var kanrennpc_default = KanrenNPC;

// src/game/world/actors/npc.ts
var NPC = class extends actor_default {
  width;
  height;
  constructor(x, y, width, height) {
    super(x, y);
    this.width = width;
    this.height = height;
  }
  description() {
    return "npc";
  }
  decideAction(game) {
    if (this.isIdle()) {
      const x = Math.floor(Math.random() * this.width);
      const y = Math.floor(Math.random() * this.height);
      this.setAction(new moveaction_default(x, y));
    }
    return this.nextAction();
  }
};
var npc_default = NPC;

// src/game/world/actors/player.ts
var Player = class extends actor_default {
  description() {
    return "player";
  }
  isPlayer() {
    return true;
  }
  decideAction(game) {
    return this.nextAction();
  }
};
var player_default = Player;

// src/game/world/entities/entity.ts
var Entity = class {
  x;
  y;
  constructor(x, y) {
    this.x = x;
    this.y = y;
  }
};
var entity_default = Entity;

// src/game/world/entities/table.ts
var Table = class extends entity_default {
  description() {
    return "table";
  }
};
var table_default = Table;

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
  entities = [];
  actors = [];
  player;
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
    this.entities.push(new table_default(8, 9));
    this.player = new player_default(1, 1);
    this.actors.push(this.player);
    this.actors.push(new npc_default(2, 2, width, height));
    this.actors.push(new kanrennpc_default(3, 3));
  }
  actorById(id) {
    for (const a of this.actors) {
      if (a.id == id) return a;
    }
    return null;
  }
  entityAt(x, y) {
    for (let entity of this.entities) {
      if (entity.x == x && entity.y == y)
        return entity;
    }
    return null;
  }
  actorAt(x, y) {
    for (let actor of this.actors) {
      if (actor.x == x && actor.y == y)
        return actor;
    }
    return null;
  }
  actorOrEntityAt(x, y) {
    const actor = this.actorAt(x, y);
    return actor ? actor : this.entityAt(x, y);
  }
};
var world_default = World;

// src/game/game.ts
var Game = class {
  world;
  pathfinding;
  shadowcasting;
  rounds = 0;
  actorIndex = 0;
  pendingActions = [];
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
  update() {
    const actor = this.world.actors[this.actorIndex];
    const action = actor.decideAction(this);
    let advanced = false;
    if (action) {
      let actionResult;
      let currentAction = action;
      while (true) {
        const result = currentAction.perform(this, actor);
        if (!Array.isArray(result)) {
          actionResult = result;
          break;
        }
        if (result.length == 0) {
          actionResult = false;
          break;
        }
        actor.addActions(result);
        currentAction = actor.nextAction();
      }
      if (actionResult)
        this.pendingActions.push({ actor, action: currentAction });
    }
    this.actorIndex = (this.actorIndex + 1) % this.world.actors.length;
    if (this.actorIndex == 0) {
      this.rounds++;
      const pendingActions = this.pendingActions;
      this.pendingActions = [];
      return pendingActions;
    }
    return null;
  }
};
var game_default = Game;

// src/game/world/actions/bumpaction.ts
var BumpAction = class extends action_default {
  x;
  y;
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
  perform(game, actor) {
    return true;
  }
};
var bumpaction_default = BumpAction;

// src/game/world/actions/primaryaction.ts
var PrimaryAction = class extends action_default {
  x;
  y;
  constructor(x, y) {
    super();
    this.x = x;
    this.y = y;
  }
  perform(game, actor) {
    const { x: gx, y: gy } = this;
    const map = game.world.map;
    const tile = map.get(gx, gy);
    if (tile_default.isBlocked(tile)) {
      map.set(gx, gy, tile_default.Empty);
      const path = game.findPath(actor.x, actor.y, gx, gy);
      map.set(gx, gy, tile);
      if (path && path.length > 0) {
        const last = path.pop();
        const actions = path.map((p) => new stepaction_default(p.x, p.y));
        actions.push(new bumpaction_default(last.x, last.y));
        return actions;
      }
      return false;
    }
    return [new moveaction_default(gx, gy)];
  }
};
var primaryaction_default = PrimaryAction;

// src/ui/animationinfo.ts
var AnimationInfo = class {
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
  backgroundColors;
  foregroundColors;
  cycles;
  spriteIndex = 0;
  spriteCycleAcc = 0;
  constructor(actor, spriteWidth, spriteHeight, sprites, backgroundColors, foregroundColors) {
    this.actor = actor;
    this.absoluteX = actor.x * spriteWidth;
    this.absoluteY = actor.y * spriteHeight;
    this.goalX = this.absoluteX;
    this.goalY = this.absoluteY;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.sprites = sprites;
    this.backgroundColors = backgroundColors;
    this.foregroundColors = foregroundColors;
    this.cycles = Math.max(sprites.length, backgroundColors.length, foregroundColors.length);
  }
  get sprite() {
    return this.sprites[this.spriteIndex % this.sprites.length];
  }
  get backgroundColor() {
    return this.backgroundColors[this.spriteIndex % this.backgroundColors.length];
  }
  get foregroundColor() {
    return this.foregroundColors[this.spriteIndex % this.foregroundColors.length];
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
      this.bump(action.x, action.y);
    else if (action instanceof stepaction_default)
      this.move(action.x, action.y);
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
var animationinfo_default = AnimationInfo;

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
  static Blue = new _Color(0, 0, 255, 255);
  static Green = new _Color(0, 255, 0, 255);
  static Brown = new _Color(102, 51, 0, 255);
  static DarkBrown = new _Color(51, 25, 0, 255);
  static BrightYellow = new _Color(255, 234, 0, 255);
  static NotVisible = new _Color(0, 0, 0, 0.5);
  static MouseIndicator = new _Color(0, 160, 0, 0.5);
  static GoalIndicator = new _Color(0, 0, 160, 0.5);
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
  gx = 0;
  gy = 0;
  game = new game_default(this.width, this.height);
  world = this.game.world;
  map = this.world.map;
  animations = /* @__PURE__ */ new Map();
  async initialize(canvasId, spriteSheetUrl, spriteSheetWidth, spriteSheetHeight, originalSpriteWidth, originalSpriteHeight) {
    this.sprites = new sprites_default(originalSpriteWidth, originalSpriteHeight);
    await this.sprites.loadFromURL(spriteSheetUrl, spriteSheetWidth, spriteSheetHeight);
    const canvas = document.getElementById(canvasId);
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    this.ctx = ctx;
    canvas.addEventListener("mousemove", (event) => this.handleMouseMove(event));
    canvas.addEventListener("mousedown", (event) => this.handleMouseDown(event));
    for (const actor of this.world.actors) {
      const animationInfo = this.createAnimationInfo(actor);
      if (animationInfo)
        this.animations.set(actor, animationInfo);
    }
  }
  createAnimationInfo(actor) {
    if (actor instanceof player_default)
      return new animationinfo_default(actor, this.spriteWidth, this.spriteHeight, [1], [color_default.White], [color_default.Black]);
    if (actor instanceof npc_default)
      return new animationinfo_default(actor, this.spriteWidth, this.spriteHeight, [1], [color_default.White], [color_default.Red]);
    if (actor instanceof kanrennpc_default)
      return new animationinfo_default(actor, this.spriteWidth, this.spriteHeight, [1], [color_default.White], [color_default.Blue]);
    return null;
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
    this.game.refreshVisibility();
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
    if (!this.map.isExplored(mx, my)) return;
    if (event.buttons == 4 || event.ctrlKey && event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.world.player.setAction(new primaryaction_default(mx, my));
    } else if (event.buttons == 1) {
      this.gx = mx;
      this.gy = my;
      this.world.player.setAction(new primaryaction_default(mx, my));
    }
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
    let anyMoving = false;
    for (const actor of this.world.actors) {
      const animation = this.animations.get(actor);
      if (animation) {
        animation.updateAnimation(delta);
        if (animation.isMoving()) anyMoving = true;
      }
    }
    if (!anyMoving) {
      const actorActions = this.game.update();
      if (actorActions) {
        for (const actorAction of actorActions) {
          const animationInfo = this.animations.get(actorAction.actor);
          if (animationInfo) animationInfo.animate(actorAction.action);
        }
      }
    }
  }
  // drawing
  draw() {
    const ctx = this.ctx;
    const mx = this.mx;
    const my = this.my;
    const spriteWidth = this.spriteWidth;
    const spriteHeight = this.spriteHeight;
    const map = this.map;
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, this.width * spriteWidth, this.height * spriteHeight);
    const tileSpriteCache = [];
    const tileBackgroundCache = [];
    const tileForegroundCache = [];
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
    for (let entity of this.world.entities) {
      if (map.isVisible(entity.x, entity.y))
        this.drawEntity(entity);
    }
    for (let actor of this.world.actors) {
      if (map.isVisible(actor.x, actor.y))
        this.drawActor(actor);
    }
    if (!this.world.player.isIdle())
      this.drawRect(this.gx, this.gy, color_default.GoalIndicator);
    this.drawRect(mx, my, color_default.MouseIndicator);
    if (map.isExplored(mx, my)) {
      let tileText = null;
      if (map.isVisible(mx, my)) {
        const tileEntity = this.world.actorOrEntityAt(mx, my);
        if (tileEntity) tileText = tileEntity.description();
        else tileText = tile_default.description(map.get(mx, my));
      } else tileText = tile_default.description(map.get(mx, my));
      if (tileText) {
        ctx.font = "12px monospace";
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, tileText.length * 8 + 5, 16);
        ctx.fillStyle = "black";
        ctx.fillText(tileText, 5, 10);
      }
    }
    const fpsText = `fps: ${this.fps.toFixed(2)}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * spriteWidth - 100, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(fpsText, this.width * spriteWidth - 100 + 5, 10);
    const posText = `pos: ${mx}, ${my}`;
    ctx.font = "12px monospace";
    ctx.fillStyle = "white";
    ctx.fillRect(this.width * spriteWidth - 200, 0, 100, 16);
    ctx.fillStyle = "black";
    ctx.fillText(posText, this.width * spriteWidth - 200 + 5, 10);
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
  drawEntity(entity) {
    if (entity instanceof table_default)
      this.drawSprite(8, entity.x, entity.y, color_default.DarkBrown, color_default.Brown);
  }
  drawActor(actor) {
    const animation = this.animations.get(actor);
    if (animation)
      this.drawSpriteAbsolute(animation.sprite, animation.absoluteX, animation.absoluteY, animation.backgroundColor, animation.foregroundColor);
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
