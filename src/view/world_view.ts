import World from "../simulator/world";
import { LineSegment } from "../interfaces/LineSegment";
import ICoord from "../interfaces/ICoord";
import { Rectangle, flatten } from "../util";
import { ICanvas } from "./sim_canvas";

export default class WorldView {
    private viewRect: Rectangle; // in world coords

    constructor(private world: World, private canvas: ICanvas) {
        this.viewRect = world.getBounds();
    }

    setViewRect(newRect: Rectangle) {
        this.viewRect = newRect;
    }

    getRoadLines(): LineSegment[] {
        return flatten(this.world.map.roads.map(r => Array.from(r.toLineSegments())));
    }

    toCanvasCoords(worldCoord: ICoord): ICoord {
        let xPrime: number = (worldCoord.x - this.viewRect.x) 
            * (this.canvas.width / this.viewRect.width);
        let yPrime: number = this.canvas.height - ((worldCoord.y - this.viewRect.y) 
            * (this.canvas.height / this.viewRect.height));
        return {x: xPrime, y: yPrime};
    }

    toWorldCoords(canvasCoords: ICoord): ICoord {
        let xPrime: number = (canvasCoords.x / (this.canvas.width / this.viewRect.width))
            + this.viewRect.x;
        let yPrime: number = (this.canvas.height - canvasCoords.y) 
            / (this.canvas.height / this.viewRect.height);
        return {x: xPrime, y: yPrime};
    }
}