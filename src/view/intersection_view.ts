import Intersection from "../simulator/intersection";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";

export default class IntersectionView extends ViewElement {
    constructor(private intersection: Intersection, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        
    }
}