import Actor from "./actors/actor";
import NPC from "./actors/npc";
import Player from "./actors/player";
import M from "./map";
import Pos from "./pos";
import Tile from "./tile";

class World {
  readonly map: M;
  readonly player: Player;
  readonly actors: Actor[] = [];
  private readonly values: Map<string, number> = new Map();
  private readonly wiresOutgoing: Map<string, Pos[]> = new Map();
  private readonly wiresIncoming: Map<string, Pos[]> = new Map();

  private valuePropogationStack: Pos[] = [];

  constructor(width: number, height: number) {
    this.map = new M(width, height);
    this.player = new Player(1, 1);

    this.actors.push(this.player);
    this.actors.push(new NPC(2, 2));
    this.actors.push(new NPC(3, 3));

    // initialize a map for testing
    for (let x = 0; x < width; x++) {
      for (let y = 0; y < height; y++) {
        if (x == 0 || x == width - 1 || y == 0 || y == height - 1)
          this.map.set(x, y, Tile.Wall);
        else if (x > 5 && x < 11 && y > 5 && y < 11)
          this.map.set(x, y, Tile.Wall);
        if (x > 6 && x < 10 && y > 6 && y < 10)
          this.map.set(x, y, Tile.Empty);
        if (x == 8 && y == 6)
          this.map.set(x, y, Tile.ClosedDoor);
      }
    }

    this.map.set(8, 4, Tile.Fire);

    this.map.set(7, 9, Tile.Chair);
    this.map.set(8, 9, Tile.Table);
    this.map.set(9, 9, Tile.Chair);

    this.map.set(9, 7, Tile.Computer);
    this.map.set(7, 7, Tile.LightbulbOff);

    this.map.set(3, 14, Tile.SwitchOff);
    this.map.set(3, 16, Tile.SwitchOn);
    this.map.set(6, 15, Tile.GateNand);
    this.map.set(9, 15, Tile.LightbulbOff);

    this.map.set(3, 12, Tile.Button);
    this.map.set(5, 12, Tile.LightbulbOff);

    this.addWire(9, 7, 7, 7);
    this.addWire(3, 14, 6, 15);
    this.addWire(3, 16, 6, 15);
    this.addWire(6, 15, 9, 15);

    this.addWire(3, 12, 5, 12);

    this.setValue(3, 14, 0);
    this.setValue(3, 16, 0);

    this.setValue(3, 12, 0);
    this.setValue(5, 12, 0);

    this.propogateValues(10000);
  }

  hasValue(x: number, y: number): boolean {
    return this.values.has(`${x},${y}`);
  }

  getValue(x: number, y: number): number {
    return this.values.get(`${x},${y}`) || 0;
  }

  setValue(x: number, y: number, value: number): void {
    this.values.set(`${x},${y}`, value)
    for (const target of this.getOutgoingWires(x, y)) this.updateValueAt(target);
  }

  update(): void {
    this.propogateValues();
  }

  private propogateValues(limit: number = 100): void {
    let stack = this.valuePropogationStack;
    let loops = 0; // infinite loop protection
    while (stack.length > 0 && loops++ < limit) {
      const { x, y } = stack.pop()!;
      const tile = this.map.get(x, y);
      if (tile == Tile.GateNand) {
        let anyZero = false;
        for (const source of this.getIncomingWires(x, y)) {
          if (this.getValue(source.x, source.y) == 0) {
            anyZero = true;
            break;
          }
        }
        stack = this.propogate(stack, x, y, anyZero ? 1 : 0) || stack;
      } else if (tile == Tile.LightbulbOn || tile == Tile.LightbulbOff) {
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
        if (newstack) this.map.set(x, y, newValue ? Tile.LightbulbOn : Tile.LightbulbOff);
      }
    }
    this.valuePropogationStack = stack;
  }

  private propogate(stack: Pos[], x: number, y: number, newValue: number): Pos[] | null {
    if (newValue != this.getValue(x, y)) {
      this.setValue(x, y, newValue);
      const outgoing = this.getOutgoingWires(x, y);
      return outgoing.length > 0 ? outgoing.concat(stack) : stack;
    }
    return null;
  }

  private updateValueAt(pos: Pos): void {
    this.valuePropogationStack = [pos].concat(this.valuePropogationStack);
  }

  getOutgoingWires(x: number, y: number): Pos[] {
    return this.wiresOutgoing.get(`${x},${y}`) || [];
  }

  getIncomingWires(x: number, y: number): Pos[] {
    return this.wiresIncoming.get(`${x},${y}`) || [];
  }

  addWire(x: number, y: number, tx: number, ty: number): void {
    const outgoing = this.getOutgoingWires(x, y);
    for (const wire of outgoing) {
      if (wire.x == tx && wire.y == ty)
        return;
    }
    const incoming = this.getIncomingWires(tx, ty);
    const target = new Pos(tx, ty);
    outgoing.push(target);
    incoming.push(new Pos(x, y));
    this.wiresOutgoing.set(`${x},${y}`, outgoing);
    this.wiresIncoming.set(`${tx},${ty}`, incoming);
    this.updateValueAt(target);
  }

  removeWire(x: number, y: number, tx: number, ty: number): void {
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
    this.updateValueAt(new Pos(tx, ty));
  }

  actorAt(x: number, y: number): Actor | null {
    for (const actor of this.actors) {
      if (actor.x == x && actor.y == y)
        return actor;
    }
    return null;
  }
}

export default World;
