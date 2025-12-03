enum Tile {
  Empty = 0,
  Wall,
  ClosedDoor,
  OpenDoor,
  Fire,
  Chair,
  Table,
  Computer,
  LightbulbOff,
  LightbulbOn,
  SwitchOff,
  SwitchOn,
  GateNand,
  Button,
}

namespace Tile {
  export function isBlocked(tile: Tile): boolean {
    switch (tile) {
      case Tile.Wall: return true;
      case Tile.ClosedDoor: return true;
      case Tile.Fire: return true;
      case Tile.Table: return true;
      case Tile.Computer: return true;
      case Tile.LightbulbOff: return true;
      case Tile.LightbulbOn: return true;
      case Tile.SwitchOff: return true;
      case Tile.SwitchOn: return true;
      case Tile.GateNand: return true;
      default: return false;
    }
  }

  export function blocksView(tile: Tile): boolean {
    return tile == Tile.Wall || tile == Tile.ClosedDoor;
  }

  export function description(tile: Tile): string | null {
    switch (tile) {
      case Tile.ClosedDoor: return "door (closed)";
      case Tile.OpenDoor: return "door (open)";
      case Tile.Fire: return "fire";
      case Tile.Chair: return "chair";
      case Tile.Table: return "table";
      case Tile.Computer: return "computer";
      case Tile.LightbulbOff: return "lightbulb";
      case Tile.LightbulbOn: return "lightbulb";
      case Tile.SwitchOff: return "switch";
      case Tile.SwitchOn: return "switch";
      case Tile.GateNand: return "NAND gate";
      case Tile.Button: return "button";
      default: return null;
    }
  }
}

export default Tile;
