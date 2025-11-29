import Color from "../color";
import AnimatedTile from "./animatedtile";
import GraphicsTile from "./graphicstile";
import StaticTile from "./statictile";

const tiles: GraphicsTile[] = [
  // Empty
  new StaticTile(0, Color.Transparent, Color.Transparent),
  // Wall
  new StaticTile(1, Color.Transparent, Color.Black),
  // ClosedDoor
  new StaticTile(2, Color.Transparent, Color.Black),
  // OpenDoor
  new StaticTile(3, Color.Transparent, Color.Black),
  // Fire
  new AnimatedTile([4, 5], [Color.Transparent], [Color.Red, new Color(155, 0, 0, 255)], 2, 2),
  // Chair
  new StaticTile(6, Color.Transparent, Color.Brown),
  // Table
  new StaticTile(7, Color.Transparent, Color.Brown),
];

export default tiles;