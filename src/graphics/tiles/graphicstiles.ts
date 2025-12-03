import Color from "../color";
import AnimatedTile from "./animatedtile";
import GraphicsTile from "./graphicstile";
import StaticTile from "./statictile";

const tiles: GraphicsTile[] = [
  // Empty
  new StaticTile(0, Color.Transparent, Color.Transparent),
  // Wall
  new StaticTile(2, Color.Transparent, Color.Black),
  // ClosedDoor
  new StaticTile(3, Color.Transparent, Color.Black),
  // OpenDoor
  new StaticTile(4, Color.Transparent, Color.Black),
  // Fire
  new AnimatedTile([5, 6], [Color.Transparent], [Color.Red, new Color(155, 0, 0, 255)], 2, 2),
  // Chair
  new StaticTile(7, Color.Transparent, Color.Brown),
  // Table
  new StaticTile(8, Color.Transparent, Color.Brown),
  // Computer
  new AnimatedTile([9, 10], [Color.White], [Color.DarkGrey], 4, 4),
  // LightbulbOff
  new StaticTile(11, Color.Transparent, Color.DarkGrey),
  // LightbulbOn
  new StaticTile(11, Color.Transparent, Color.BrightYellow),
  // SwitchOff
  new StaticTile(13, Color.Transparent, Color.DarkGrey),
  // SwitchOn
  new StaticTile(14, Color.Transparent, Color.DarkGrey),
  // GateNand
  new StaticTile(12, Color.White, Color.DarkGrey),
  // Button
  new StaticTile(15, Color.Transparent, Color.DarkGrey),
];

export default tiles;