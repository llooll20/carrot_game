export class Tile {
    constructor(x, y) {
        this.X = x;
        this.Y = y;
        // 지형 정보
        this.TerrainType = "grassfield";
        // 생산기반 정보
        this.ProductionBase = null;
    }
}
