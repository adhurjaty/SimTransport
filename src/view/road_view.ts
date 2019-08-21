import Road from "../models/road";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { LineSegment } from "../interfaces/LineSegment";
import { Rectangle } from "../util";
import Coord from "../interfaces/Coord";
import { midlineRectCoords, drawFilledPolygon, offsetLine } from "./view_helper";
import { LANE_COLOR, LANE_WIDTH, SIDEWALK_WIDTH, SIDEWALK_COLOR, LINE_WIDTH, LINE_COLOR } from "../constants";


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
        let totalWidth: number = this.toCanvasSize(SIDEWALK_WIDTH * 2 +
            LANE_WIDTH * (this.road.charmLanes + this.road.strangeLanes),
            viewRect);
        let coords: Coord[] = midlineRectCoords(seg, totalWidth);

        ctx.fillStyle = SIDEWALK_COLOR;
        drawFilledPolygon(coords, ctx);
    }

    private drawLanes(seg: LineSegment, ctx: CanvasRenderingContext2D,
        viewRect: Rectangle): void 
    {
        let totalWidth: number = this.toCanvasSize(
            LANE_WIDTH * (this.road.charmLanes + this.road.strangeLanes),
            viewRect);
        let coords: Coord[] = midlineRectCoords(seg, totalWidth);
        
        ctx.fillStyle = LANE_COLOR;
        drawFilledPolygon(coords, ctx);
    }

    private drawYellowLine(seg: LineSegment, ctx: CanvasRenderingContext2D,
        viewRect: Rectangle): void
    {
        let totalWidth: number = this.toCanvasSize(LINE_WIDTH, viewRect);
        let offsetDist: number = this.toCanvasSize(
            LANE_WIDTH * (this.road.strangeLanes - this.road.charmLanes), viewRect);
        let centerLine: LineSegment = offsetLine(seg, offsetDist);
        let coords: Coord[] = midlineRectCoords(centerLine, totalWidth);

        ctx.fillStyle = LINE_COLOR;
        drawFilledPolygon(coords, ctx);
    }
}