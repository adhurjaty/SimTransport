import World from "../simulator/world";
import { LineSegment } from "../interfaces/LineSegment";
import ICoord from "../interfaces/ICoord";
import { Rectangle } from "../util";
import { ICanvas } from "./sim_canvas";

export default class WorldView {
    private viewRect: Rectangle
    constructor(private world: World, private canvas: ICanvas) {
        this.viewRect = world.getBounds();
    }

    setViewRect(newRect: Rectangle) {
        this.viewRect = newRect;
    }

    getRoadLines(): LineSegment[] {
        
    }

    toCanvasCoords(worldCoord: ICoord): ICoord {

    }

    toWorldCoords(canvasCoords: ICoord): ICoord {

    }
}