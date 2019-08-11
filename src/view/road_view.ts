import Road from "../models/road";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { LineSegment } from "../interfaces/LineSegment";
import { Rectangle } from "../util";

export default class RoadView extends ViewElement {
    constructor(private road: Road, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let segs: LineSegment[] = Array.from(this.road.toLineSegments()).map(l => 
            <LineSegment>l.map(c => this.toCanvasCoords(c, viewRect)));

        ctx.strokeStyle = "black";
        ctx.beginPath();
        segs.forEach(line => {
            ctx.moveTo(line[0].x, line[0].y);
            ctx.lineTo(line[1].x, line[1].y);
        });
        ctx.stroke();
    }
}