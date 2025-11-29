import Map from "./map";
import Pos from "./pos";

// Adaptation of https://journal.stuffwithstuff.com/2015/09/07/what-the-hero-sees/
type Octant = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;

class Shadow {
  start: number;
  end: number;

  constructor(start: number, end: number) {
    this.start = start;
    this.end = end;
  }

  contains(other: Shadow): boolean {
    return this.start <= other.start && this.end >= other.end;
  }

  static projectTile(row: number, col: number) {
    const topLeft = col / (row + 2);
    const bottomRight = (col + 1) / (row + 1);
    return new Shadow(topLeft, bottomRight);
  }
}

class ShadowLine {
  private readonly shadows: Shadow[] = [];

  isInShadow(proj: Shadow): boolean {
    for (const s of this.shadows)
      if (s.contains(proj))
        return true;
    return false
  }

  isFullShadow(): boolean {
    const shadows = this.shadows;
    return shadows.length == 1 && shadows[0].start == 0 && shadows[0].end == 1;
  }

  add(shadow: Shadow): void {
    const shadows = this.shadows;
    let index = 0;
    for (; index < shadows.length; index++) {
      if (shadows[index].start >= shadow.start)
        break;
    }
    let overlappingPrevious: Shadow | null = null;
    if (index > 0 && shadows[index - 1].end > shadow.start)
      overlappingPrevious = shadows[index - 1];
    let overlappingNext: Shadow | null = null;
    if (index < shadows.length && shadows[index].start < shadow.end)
      overlappingNext = shadows[index];
    if (overlappingNext) {
      if (overlappingPrevious) {
        overlappingPrevious.end = overlappingNext.end;
        shadows.splice(index, 1);
      } else {
        overlappingNext.start = shadow.start;
      }
    } else {
      if (overlappingPrevious) {
        overlappingPrevious.end = shadow.end;
      } else {
        shadows.splice(index, 0, shadow);
      }
    }
  }
}

class ShadowCasting {
  private readonly map: Map;

  constructor(map: Map) {
    this.map = map;
  }

  refreshVisibility(x: number, y: number): void {
    this.refreshOctant(x, y, 0);
    this.refreshOctant(x, y, 1);
    this.refreshOctant(x, y, 2);
    this.refreshOctant(x, y, 3);
    this.refreshOctant(x, y, 4);
    this.refreshOctant(x, y, 5);
    this.refreshOctant(x, y, 6);
    this.refreshOctant(x, y, 7);
    this.map.setVisible(x, y, true);
  }

  private refreshOctant(x: number, y: number, octant: Octant): void {
    const width = this.map.width;
    const height = this.map.height;
    const line = new ShadowLine();
    let fullShadow = false;
    for (let row = 1; ; row++) {
      const posOctantTop = ShadowCasting.transformOctant(row, 0, octant);
      const posXTop = x + posOctantTop.x;
      const posYTop = y + posOctantTop.y;
      if (posXTop < 0 || posXTop >= width || posYTop < 0 || posYTop >= height) break;
      for (let col = 0; col <= row; col++) {
        const posOctant = ShadowCasting.transformOctant(row, col, octant);
        const posX = x + posOctant.x;
        const posY = y + posOctant.y;
        if (posX < 0 || posX >= width || posY < 0 || posY >= height) break;
        if (fullShadow)
          this.map.setVisible(posX, posY, false);
        else {
          const proj = Shadow.projectTile(row, col);
          const visible = !line.isInShadow(proj);
          this.map.setVisible(posX, posY, visible);
          if (visible && this.map.blocksView(posX, posY)) {
            line.add(proj);
            fullShadow = line.isFullShadow();
          }
        }
      }
    }
  }

  private static transformOctant(row: number, col: number, octant: Octant): Pos {
    switch (octant) {
      case 0: return new Pos(col, -row);
      case 1: return new Pos(row, -col);
      case 2: return new Pos(row, col);
      case 3: return new Pos(col, row);
      case 4: return new Pos(-col, row);
      case 5: return new Pos(-row, col);
      case 6: return new Pos(-row, -col);
      case 7: return new Pos(-col, -row);
    }
  }
}

export default ShadowCasting;
