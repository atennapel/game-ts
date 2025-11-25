import M from "./map";
import Pos from "./pos";
import PriorityQueue from './priorityqueue';

// Adaptation of https://www.redblobgames.com/pathfinding/a-star/implementation.html#algorithm
class Loc {
  readonly x: number;
  readonly y: number;
  readonly hash: number;
  private readonly priority: number;

  constructor(x: number, y: number, priority: number) {
    this.x = x;
    this.y = y;
    this.hash = x * 100000 + y;
    this.priority = priority;
  }

  compare(other: Loc): number {
    return this.priority - other.priority;
  }

  equals(other: Loc): boolean {
    return this.x == other.x && this.y == other.y;
  }

  neighbours(map: M): Loc[] {
    const ns: Loc[] = [];
    const x = this.x;
    const y = this.y;
    for (let nx = x - 1; nx <= x + 1; nx++) {
      for (let ny = y - 1; ny <= y + 1; ny++) {
        if (nx < 0 || nx >= map.width || ny < 0 || ny >= map.height || (nx == x && ny == y) || map.isBlocked(nx, ny))
          continue;
        ns.push(new Loc(nx, ny, 0));
      }
    }
    return ns;
  }

  toString() {
    return `(${this.x}, ${this.y}, ${this.priority})`;
  }
}

class PathFinding {
  private readonly map: M;

  constructor(map: M) {
    this.map = map;
  }

  private static heuristic(x: number, y: number, gx: number, gy: number): number {
    const ox = Math.abs(gx - x);
    const oy = Math.abs(gy - y);
    const diagonal = Math.min(ox, oy);
    const straight = Math.max(ox, oy) - diagonal;
    return straight * 10 + diagonal * 11;
  }

  private cost(x: number, y: number): number {
    return 10;
  }

  findPath(x: number, y: number, gx: number, gy: number): Pos[] | null {
    const cameFrom: Map<number, Loc> = new Map();
    const costSoFar: Map<number, number> = new Map();
    const frontier: PriorityQueue<Loc> = new PriorityQueue(10, (a: Loc, b: Loc) => a.compare(b));

    const goal = new Loc(gx, gy, 0);
    const start = new Loc(x, y, 0);
    frontier.add(start);
    cameFrom.set(start.hash, start);
    costSoFar.set(start.hash, 0);

    while (frontier.size() > 0) {
      const current = frontier.poll()!;
      if (current.equals(goal)) break;
      for (const next of current.neighbours(this.map)) {
        const newCost = costSoFar.get(current.hash)! + this.cost(next.x, next.y);
        if (!costSoFar.has(next.hash) || newCost < costSoFar.get(next.hash)!) {
          costSoFar.set(next.hash, newCost);
          const priority = newCost + PathFinding.heuristic(next.x, next.y, gx, gy);
          frontier.add(new Loc(next.x, next.y, priority));
          cameFrom.set(next.hash, current);
        }
      }
    }

    if (!cameFrom.get(goal.hash)) return null;

    const result: Pos[] = [new Pos(gx, gy)];
    let current = goal;
    while (!current.equals(start)) {
      const next = cameFrom.get(current.hash)!;
      if (next.equals(start)) {
        result.reverse();
        return result;
      }
      result.push(new Pos(next.x, next.y));
      current = next;
    }
    return null;
  }
}

export default PathFinding;
