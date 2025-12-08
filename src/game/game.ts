import PathFinding from "./pathfinding";
import ShadowCasting from "./shadowcasting";
import Action from "./world/actions/action";
import Actor from "./world/actors/actor";
import Pos from "./world/pos";
import World from "./world/world";

type ActorAction = { actor: Actor, action: Action };

class Game {
  readonly world: World;
  private readonly pathfinding: PathFinding;
  private readonly shadowcasting: ShadowCasting;

  private rounds: number = 0;
  private actorIndex: number = 0;
  private pendingActions: ActorAction[] = [];

  constructor(width: number, height: number) {
    this.world = new World(width, height);
    this.pathfinding = new PathFinding(this.world.map);
    this.shadowcasting = new ShadowCasting(this.world.map);
  }

  findPath(x: number, y: number, gx: number, gy: number): Pos[] | null {
    return this.pathfinding.findPath(x, y, gx, gy);
  }

  refreshVisibility(): void {
    const player = this.world.player;
    this.shadowcasting.refreshVisibility(player.x, player.y);
  }

  update(): ActorAction[] | null {
    const actor = this.world.actors[this.actorIndex];
    const action = actor.decideAction();
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
        currentAction = actor.nextAction()!;
      }
      if (actionResult) {
        this.pendingActions.push({ actor, action: currentAction });
        this.advanceActor();
        advanced = true;
      }
    } else {
      this.advanceActor();
      advanced = true;
    }
    if (advanced && this.actorIndex == 0) {
      this.rounds++;
      const pendingActions = this.pendingActions;
      this.pendingActions = [];
      return pendingActions;
    }
    return null;
  }

  private advanceActor(): void {
    this.actorIndex = (this.actorIndex + 1) % this.world.actors.length;
  }
}

export default Game;