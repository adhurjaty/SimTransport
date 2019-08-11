import Road from "../models/road";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";

export default class RoadView extends ViewElement {
    constructor(private road: Road, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        
    }
}