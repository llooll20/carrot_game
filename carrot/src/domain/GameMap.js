import { Tile } from "../models/Tile.js";

export class GameMap {
    constructor(width, height) {
        this.Tiles = [];

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                this.Tiles.push(new Tile(x, y));
            }
        }
    }

    getTile(x, y) {
        return this.Tiles.find(
            tile => tile.X === x && tile.Y === y
        );
    }
}
