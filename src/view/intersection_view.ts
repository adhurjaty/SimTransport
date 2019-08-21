import Intersection from "../simulator/intersection";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle } from "../util";
import ICoord from "../interfaces/ICoord";
import { LineSegment } from "../interfaces/LineSegment";
import { midlineRectCoords, drawFilledPolygon } from "./view_helper";
import { LANE_WIDTH, LANE_COLOR } from "../constants";

export default class IntersectionView extends ViewElement {
    constructor(private intersection: Intersection, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        this.drawSquare(ctx, viewRect);
    }

    private drawSquare(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let worldCoords: ICoord[] = this.getSquareWorldCoords();
        let coords: ICoord[] = worldCoords.map(c => this.toCanvasCoords(c, viewRect));

        ctx.fillStyle = LANE_COLOR;
        drawFilledPolygon(coords, ctx)
    }

    private getSquareWorldCoords(): ICoord[] {
        let chord: LineSegment = this.intersection.getChord();
        let width: number = LANE_WIDTH * 
            (this.intersection.roads[1].charmLanes + this.intersection.roads[1].strangeLanes);
        return midlineRectCoords(chord, width);
    }

    private drawBorder(ctx: CanvasRenderingContext2D): void {

    }
}