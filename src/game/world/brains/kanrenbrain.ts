import Game from "../../game";
import Action from "../actions/action";
import MoveAction from "../actions/moveaction";
import Actor from "../actors/actor";
import Brain from "./brain";

abstract class Stream<T> {
  static empty: Stream<never>;
  static singleton<T>(value: T): Stream<T> {
    return new Ext(value, this.empty);
  }

  abstract map<R>(f: (value: T) => R): Stream<R>;
  abstract interleave(other: Stream<T>): Stream<T>;
  abstract then<R>(k: (value: T) => Stream<R>): Stream<R>;
  abstract take(n: number, result?: T[]): T[];
  abstract takeWhile(f: (value: T) => boolean, result?: T[]): T[];
}

class Empty extends Stream<never> {
  override map<R>(f: (value: never) => R): Stream<R> {
    return this;
  }
  override interleave<T>(other: Stream<T>): Stream<T> {
    return other;
  }
  override then<R>(k: (value: never) => Stream<R>): Stream<R> {
    return this;
  }
  override take(n: number, result: never[] = []): never[] {
    return result;
  }
  override takeWhile(f: (value: never) => boolean, result: never[] = []): never[] {
    return result;
  }
}
Stream.empty = new Empty();

class Ext<T> extends Stream<T> {
  readonly head: T;
  readonly tail: Stream<T>;

  constructor(head: T, tail: Stream<T>) {
    super();
    this.head = head;
    this.tail = tail;
  }

  override map<R>(f: (value: T) => R): Stream<R> {
    return new Ext(f(this.head), this.tail.map(f));
  }
  override interleave(other: Stream<T>): Stream<T> {
    return new Ext(this.head, this.tail.interleave(other));
  }
  override then<R>(k: (value: T) => Stream<R>): Stream<R> {
    return k(this.head).interleave(this.tail.then(k));
  }
  override take(n: number, result: T[] = []): T[] {
    if (n <= 0) return result;
    result.push(this.head);
    return this.tail.take(n - 1, result);
  }
  override takeWhile(f: (value: T) => boolean, result: T[] = []): T[] {
    if (!f(this.head)) return result;
    result.push(this.head);
    return this.tail.takeWhile(f, result);
  }
}

class Delay<T> extends Stream<T> {
  private readonly thunk: () => Stream<T>;
  private value: Stream<T> | null = null;

  constructor(thunk: () => Stream<T>) {
    super();
    this.thunk = thunk;
  }

  force(): Stream<T> {
    if (!this.value) this.value = this.thunk();
    return this.value;
  }

  override map<R>(f: (value: T) => R): Stream<R> {
    return new Delay(() => this.force().map(f));
  }
  override interleave(other: Stream<T>): Stream<T> {
    return new Delay(() => other.interleave(this.force()));
  }
  override then<R>(k: (value: T) => Stream<R>): Stream<R> {
    return new Delay(() => this.force().then(k));
  }
  override take(n: number, result: T[]): T[] {
    return this.force().take(n, result);
  }
  override takeWhile(f: (value: T) => boolean, result: T[] = []): T[] {
    return this.force().takeWhile(f, result);
  }
}

type VarId = number;

class Var {
  readonly id: VarId;

  constructor(id: VarId) {
    this.id = id;
  }
}

type Term = Var | number | string | boolean | null | Term[];
type Env = Map<VarId, Term>;

abstract class Constraint {
  abstract terms: Term[];
}

class State {
  private readonly nextId: VarId;
  readonly env: Env;
  readonly constraints: Map<VarId, Constraint[]>;

  private constructor(nextId: VarId, env: Env, constraints: Map<VarId, Constraint[]>) {
    this.nextId = nextId;
    this.env = env;
    this.constraints = constraints;
  }

  static empty: State = new State(0, new Map(), new Map());

  newVar(): [State, Var] {
    return [new State(this.nextId + 1, this.env, this.constraints), new Var(this.nextId)];
  }

  withEnv(env: Env): State {
    return new State(this.nextId, env, this.constraints);
  }

  withConstraints(v: VarId, cs: Constraint[]): State {
    const n = new Map(this.constraints);
    if (cs.length == 0) n.delete(v);
    else n.set(v, cs);
    return new State(this.nextId, this.env, n);
  }

  withConstraint(c: Constraint): State {
    const env = this.env;
    const newConstraints = new Map(this.constraints);
    for (const t of c.terms) {
      for (const v of State.vars(Goal.zonk(env, t))) {
        const a = newConstraints.get(v) || [];
        newConstraints.set(v, a.concat([c]));
      }
    }
    return new State(this.nextId, this.env, newConstraints);
  }

  private static vars(t: Term, result: VarId[] = []): VarId[] {
    if (t instanceof Var) {
      if (result.indexOf(t.id) >= 0) return result;
      result.push(t.id);
      return result;
    } else if (Array.isArray(t)) {
      for (const x of t) State.vars(x, result);
      return result;
    }
    return result;
  }
}

class InequalityConstraint extends Constraint {
  readonly left: Term;
  readonly right: Term;
  readonly terms: Term[];

  constructor(left: Term, right: Term) {
    super();
    this.left = left;
    this.right = right;
    this.terms = [left, right];
  }
}

class Goal {
  private readonly apply: (state: State) => Stream<State>;

  private constructor(cont: (state: State) => Stream<State>) {
    this.apply = cont;
  }

  static delay(g: () => Goal): Goal {
    return new Goal(state => g().apply(state));
  }

  static succeed: Goal = new Goal(state => Stream.singleton(state));
  static fail: Goal = new Goal(state => Stream.empty);

  delay(): Goal {
    return new Goal(state => new Delay(() => this.apply(state)));
  }

  static equals(a: Term, b: Term): Goal {
    return new Goal(state => {
      const res = Goal.unify(state, a, b);
      return res ? Stream.singleton(res) : Stream.empty;
    });
  }

  static notEquals(a0: Term, b0: Term): Goal {
    return new Goal(state => {
      const a = Goal.zonk(state.env, a0);
      const b = Goal.zonk(state.env, b0);
      if (Goal.ground(a) && Goal.ground(b))
        return Goal.groundEquals(a, b) ? Stream.empty : Stream.singleton(state);
      return Stream.singleton(state.withConstraint(new InequalityConstraint(a, b)));
    });
  }

  static groundEquals(a: Term, b: Term): boolean {
    if (Array.isArray(a)) {
      if (!Array.isArray(b)) return false;
      const l = a.length;
      if (b.length != l) return false;
      for (let i = 0; i < l; i++)    if (!Goal.groundEquals(a[i], b[i])) return false;
      return true;
    }
    return a === b;
  }

  static exists(k: (vr: Term) => Goal): Goal {
    return new Goal(state => {
      const [newState, newVar] = state.newVar();
      return k(newVar).apply(newState);
    });
  }

  static exists2(k: (v1: Term, v2: Term) => Goal): Goal {
    return Goal.exists(v1 => Goal.exists(v2 => k(v1, v2)));
  }

  or(b: Goal): Goal {
    return new Goal(state => this.apply(state).interleave(b.apply(state)));
  }
  and(b: Goal): Goal {
    return new Goal(state => this.apply(state).then(b.apply));
  }

  static any(x: Term, options: Term[]): Goal {
    let cur = Goal.fail;
    for (const v of options)
      cur = cur.or(Goal.equals(x, v)).delay();
    return cur;
  }

  static all(x: Term, options: Term[]): Goal {
    let cur = Goal.succeed;
    for (const v of options)
      cur = cur.and(Goal.equals(x, v)).delay();
    return cur;
  }

  static natural(x: Term, n: number = 0): Goal {
    return Goal.equals(x, n).or(Goal.delay(() => Goal.natural(x, n + 1))).delay();
  }

  static range(x: Term, a: number, b: number): Goal {
    return a >= b ? Goal.fail : Goal.equals(x, a).or(Goal.delay(() => Goal.range(x, a + 1, b))).delay();
  }

  static run(n: number, goal: (vr: Term) => Goal): Term[] {
    const state = State.empty;
    const [nextState, newVar] = state.newVar();
    const states = goal(newVar).apply(nextState).take(n);
    const l = states.length;
    const result: Term[] = new Array(l);
    for (let i = 0; i < l; i++) {
      const state = states[i];
      result[i] = Goal.zonk(state.env, newVar);
    }
    return result;
  }

  static runGround(n: number, goal: (vr: Term) => Goal): Term[] {
    const state = State.empty;
    const [nextState, newVar] = state.newVar();
    const result: Term[] = [];
    goal(newVar).apply(nextState).takeWhile(state => {
      if (result.length >= n) return false;
      const value = Goal.zonk(state.env, newVar);
      if (!Goal.ground(value)) return true;
      result.push(value);
      return true;
    });
    return result;
  }

  private static ground(t: Term): boolean {
    if (t instanceof Var) return false;
    if (Array.isArray(t)) {
      for (const v of t) if (!this.ground(v)) return false;
      return true;
    }
    return true;
  }
  static zonk(env: Env, t: Term): Term {
    if (t instanceof Var) {
      if (env.has(t.id)) return Goal.zonk(env, env.get(t.id)!);
      return t;
    }
    if (Array.isArray(t)) {
      const l = t.length;
      const r = new Array(l);
      for (let i = 0; i < l; i++) r[i] = Goal.zonk(env, t[i]);
      return r;
    }
    return t;
  }
  private static occurs(env: Env, v: VarId, t0: Term): boolean {
    const t = Goal.zonk(env, t0);
    if (t instanceof Var) return t.id == v;
    else if (Array.isArray(t)) {
      for (const x of t) if (Goal.occurs(env, v, x)) return true;
      return false;
    }
    return false;
  }
  private static solve(state: State, v: VarId, t: Term): State | null {
    if (Goal.occurs(state.env, v, t)) return null;
    if (state.constraints.has(v)) {
      const newConstraints = state.constraints.get(v)!.map(c => Goal.solveConstraint(state, c));
      if (newConstraints.indexOf(2) >= 0) return null;
      return state.withConstraints(v, []).withEnv(new Map(state.env).set(v, t));
    }
    return state.withEnv(new Map(state.env).set(v, t));
  }
  private static unify(state: State, a0: Term, b0: Term): State | null {
    const a = Goal.zonk(state.env, a0);
    const b = Goal.zonk(state.env, b0);
    if (a instanceof Var) {
      if (b instanceof Var && (a == b || a.id == b.id)) return state;
      return Goal.solve(state, a.id, b);
    } else if (b instanceof Var) return Goal.solve(state, b.id, a);
    else if (Array.isArray(a) && Array.isArray(b)) {
      const l = a.length;
      if (b.length != l) return null;
      let acc = state;
      for (let i = 0; i < l; i++) {
        const res = Goal.unify(acc, a[i], b[i]);
        if (!res) return null;
        acc = res;
      }
      return acc;
    } else if (a === b) return state;
    return null;
  }

  // 0 = unknown, 1 = succeed, 2 = fail
  private static solveConstraint(state: State, c: Constraint): number {
    if (c instanceof InequalityConstraint) {
      const a = Goal.zonk(state.env, c.left);
      const b = Goal.zonk(state.env, c.right);
      if (Goal.ground(a) && Goal.ground(b))
        return Goal.groundEquals(a, b) ? 2 : 1;
      return 0;
    }
    return -1;
  }
}

class KanrenBrain extends Brain {
  override decideAction(game: Game, actor: Actor): Action | null {
    const goal = (p: Term) => Goal.exists2((x, y) =>
      Goal.notEquals(x, actor.x)
        .and(Goal.notEquals(y, actor.y))
        .and(KanrenBrain.position(game, x, y))
        .and(Goal.equals(p, [x, y])));
    const result = Goal.runGround(100, goal);
    if (result.length == 0) return null;
    const [x, y] = result[Math.floor(Math.random() * result.length)] as [number, number];
    return new MoveAction(x, y);
  }

  private static actor(game: Game, x: Term): Goal {
    return Goal.any(x, game.world.actors.map(a => a.id));
  }

  private static myX(actor: Actor, x: Term): Goal {
    return Goal.equals(actor.x, x);
  }

  private static myY(actor: Actor, y: Term): Goal {
    return Goal.equals(actor.y, y);
  }

  private static myPosition(actor: Actor, x: Term, y: Term): Goal {
    return KanrenBrain.myX(actor, x).and(KanrenBrain.myY(actor, y));
  }

  private static position(game: Game, x: Term, y: Term): Goal {
    if (x instanceof Var && y instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      return Goal.range(x, 0, w).and(Goal.range(y, 0, h));
    } else if (x instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof y != 'number' || y < 0 || y >= h) return Goal.fail;
      return Goal.range(x, 0, w);
    } else if (y instanceof Var) {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof x != 'number' || x < 0 || x >= w) return Goal.fail;
      return Goal.range(y, 0, h);
    } else {
      const w = game.world.map.width;
      const h = game.world.map.height;
      if (typeof x == 'number' && typeof y == 'number' && x < 0 && x >= w && y < 0 && y >= h)
        return Goal.succeed;
      return Goal.fail;
    }
  }
}

export default KanrenBrain;