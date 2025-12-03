import Action from "../world/actions/action";

class TurnResult {
  readonly actorIndex: number;
  readonly action: Action;

  constructor(actorIndex: number, action: Action) {
    this.actorIndex = actorIndex;
    this.action = action;
  }
}

export default TurnResult;