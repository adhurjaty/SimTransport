import { ICanvas } from "./sim_canvas";
import Coord from "../interfaces/Coord";
import { Rectangle } from "../util";

export default abstract class ViewElement {
    constructor(protected canvas: ICanvas) {

    }

    abstract draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void;

    toCanvasCoords(worldCoord: Coord, viewRect: Rectangle): Coord {
        let xPrime: number = (worldCoord.x - viewRect.x) 
            * (this.canvas.width / viewRect.width);
        let yPrime: number = this.canvas.height - ((worldCoord.y - viewRect.y) 
            * (this.canvas.height / viewRect.height));
        return {x: xPrime, y: yPrime};
    }

    toWorldCoords(canvasCoords: Coord, viewRect: Rectangle): Coord {
        let xPrime: number = (canvasCoords.x / (this.canvas.width / viewRect.width))
            + viewRect.x;
        let yPrime: number = (this.canvas.height - canvasCoords.y) 
            / (this.canvas.height / viewRect.height);
        return {x: xPrime, y: yPrime};
    }

    toCanvasSize(worldSize: number, viewRect: Rectangle): number {
        return worldSize * this.canvas.width / viewRect.width;
    }

    toWorldSize(canvasSize: number, viewRect: Rectangle): number {
        return canvasSize * viewRect.width / this.canvas.width;
    }
}