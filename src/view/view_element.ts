import { ICanvas } from "./sim_canvas";
import ICoord from "../interfaces/ICoord";
import { Rectangle } from "../util";

export default abstract class ViewElement {
    constructor(protected canvas: ICanvas) {

    }

    abstract draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void;

    toCanvasCoords(worldCoord: ICoord, viewRect: Rectangle): ICoord {
        let xPrime: number = (worldCoord.x - viewRect.x) 
            * (this.canvas.width / viewRect.width);
        let yPrime: number = this.canvas.height - ((worldCoord.y - viewRect.y) 
            * (this.canvas.height / viewRect.height));
        return {x: xPrime, y: yPrime};
    }

    toWorldCoords(canvasCoords: ICoord, viewRect: Rectangle): ICoord {
        let xPrime: number = (canvasCoords.x / (this.canvas.width / viewRect.width))
            + viewRect.x;
        let yPrime: number = (this.canvas.height - canvasCoords.y) 
            / (this.canvas.height / viewRect.height);
        return {x: xPrime, y: yPrime};
    }
}