import Action from "../world/actions/action";
import PathFinding from "./pathfinding";
import Pos from "../world/pos";
import ShadowCasting from "./shadowcasting";
import World from "../world/world";
import Actor from "../world/actors/actor";

class Game {
  readonly world: World;
  private readonly pathfinding: PathFinding;
  private readonly shadowcasting: ShadowCasting;

  private actorIndex: number = 0;

  turns: number = 0;
  playerTurns: number = 0;

  constructor(width: number, height: number) {
    this.world = new World(width, height);
    this.pathfinding = new PathFinding(this.world.map);
    this.shadowcasting = new ShadowCasting(this.world.map);
  }

  findPath(x: number, y: number, gx: number, gy: number): Pos[] | null {
    return this.pathfinding.findPath(x, y, gx, gy);
  }

  refreshVisibility() {
    const player = this.world.player;
    this.shadowcasting.refreshVisibility(player.x, player.y);
  }

  currentActorIndex(): number {
    return this.actorIndex;
  }

  private advanceActor() {
    this.actorIndex = (this.actorIndex + 1) % this.world.actors.length;
  }

  takeTurn(): { action: Action, actorIndex: number } | null {
    const actors = this.world.actors;
    if (actors.length == 0) return null;
    const actorIndex = this.actorIndex;
    const actor = actors[actorIndex];
    if (actor.canTakeTurn() || actor.gainEnergy()) {
      const action = actor.takeTurn(this);
      if (!action) {
        if (actor.isPlayer()) return null; // wait for input from player
        this.advanceActor();
        return null;
      } else {
        this.performAction(actor, action);
        return { action, actorIndex };
      }
    } else {
      this.advanceActor();
      return null;
    }
  }

  private performAction(actor: Actor, action: Action): void {
    const succeeded = action.perform(this, actor);
    if (succeeded) {
      actor.useEnergy(action.energyCost);
      this.advanceActor();
      this.turns++;
      if (actor.isPlayer()) this.playerTurns++;
    }
  }
}

export default Game;