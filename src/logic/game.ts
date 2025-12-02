import Action from "../world/actions/action";
import PathFinding from "./pathfinding";
import Pos from "../world/pos";
import ShadowCasting from "./shadowcasting";
import World from "../world/world";

class Game {
  readonly world: World;
  private readonly pathfinding: PathFinding;
  private readonly shadowcasting: ShadowCasting;

  private actorIndex: number = 0;
  private currentAction: Action | null = null;

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

  waitingOnAction(): boolean {
    return !!this.currentAction;
  }

  private advanceActor() {
    this.actorIndex = (this.actorIndex + 1) % this.world.actors.length;
  }

  takeTurn(): Action | null {
    if (this.currentAction) return this.currentAction;
    const actors = this.world.actors;
    if (actors.length == 0) return null;
    const actorIndex = this.actorIndex;
    const actor = actors[actorIndex];
    if (actor.canTakeTurn() || actor.gainEnergy()) {
      const action = actor.takeTurn(this);
      if (!action) {
        if (actor.isPlayer()) return null; // wait for input from player
        this.advanceActor();
      }
      this.currentAction = action;
      return action;
    } else {
      this.advanceActor();
      return null;
    }
  }

  performAction(): void {
    const action = this.currentAction;
    if (!action) return;
    const actors = this.world.actors;
    const actor = actors[this.actorIndex];
    const succeeded = action.perform(this, actor);
    this.currentAction = null;
    if (succeeded) {
      actor.useEnergy(action.energyCost);
      this.advanceActor();
      this.turns++;
      if (actor.isPlayer()) this.playerTurns++;
    }
  }
}

export default Game;