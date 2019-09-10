import Road from "../models/road";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { LineSegment } from "../interfaces/LineSegment";
import { Rectangle } from "../util";
import { Coord } from "../util";
import { midlineRectCoords, drawFilledPolygon, offsetLine } from "./view_helper";
import { GlobalParams } from "../constants"


export default class RoadView extends ViewElement {
    constructor(private road: Road, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let segs: LineSegment[] = Array.from(this.road.toLineSegments()).map(l => 
            <LineSegment>l.map(c => this.toCanvasCoords(c, viewRect)));

        for (const line of segs) {
            this.drawSidewalk(line, ctx, viewRect);
            this.drawLanes(line, ctx, viewRect);
            this.drawYellowLine(line, ctx, viewRect);
        }
    }
    
    private drawSidewalk(seg: LineSegment, ctx: CanvasRenderingContext2D,
        viewRect: Rectangle): void
    {
        // draw whole street as sidewalk and let other parts get drawn on top
        let totalWidth: number = this.toCanvasSize(GlobalParams.SIDEWALK_WIDTH * 2 +
            GlobalParams.LANE_WIDTH * (this.road.charmLanes + this.road.strangeLanes),
            viewRect);
        let coords: Coord[] = midlineRectCoords(seg, totalWidth);

        ctx.fillStyle = GlobalParams.SIDEWALK_COLOR;
        drawFilledPolygon(coords, ctx);
    }

    private drawLanes(seg: LineSegment, ctx: CanvasRenderingContext2D,
        viewRect: Rectangle): void 
    {
        let totalWidth: number = this.toCanvasSize(
            GlobalParams.LANE_WIDTH * (this.road.charmLanes + this.road.strangeLanes),
            viewRect);
        let coords: Coord[] = midlineRectCoords(seg, totalWidth);
        
        ctx.fillStyle = GlobalParams.LANE_COLOR;
        drawFilledPolygon(coords, ctx);
    }

    private drawYellowLine(seg: LineSegment, ctx: CanvasRenderingContext2D,
        viewRect: Rectangle): void
    {
        let totalWidth: number = this.toCanvasSize(GlobalParams.LINE_WIDTH, viewRect);
        let offsetDist: number = this.toCanvasSize(
            GlobalParams.LANE_WIDTH * (this.road.strangeLanes - this.road.charmLanes), viewRect);
        let centerLine: LineSegment = offsetLine(seg, offsetDist);
        let coords: Coord[] = midlineRectCoords(centerLine, totalWidth);

        ctx.fillStyle = GlobalParams.LINE_COLOR;
        drawFilledPolygon(coords, ctx);
    }
}