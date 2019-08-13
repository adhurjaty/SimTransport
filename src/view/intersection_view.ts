import Intersection from "../simulator/intersection";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle } from "../util";
import ICoord from "../interfaces/ICoord";

export default class IntersectionView extends ViewElement {
    constructor(private intersection: Intersection, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let intCoord: ICoord = this.toCanvasCoords(this.intersection.location, viewRect);
        let rad: number = 5;
        
        ctx.beginPath();
        ctx.moveTo(intCoord.x, intCoord.y);
        ctx.arc(intCoord.x, intCoord.y, rad, 0, 2 * Math.PI);
        ctx.fillStyle = "black";
        ctx.fill();
    }
}