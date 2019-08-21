import Intersection from "../simulator/intersection";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle, scaleRect, Coord, padRect } from "../util";
import { LineSegment } from "../interfaces/LineSegment";
import { midlineRectCoords, drawFilledPolygon } from "./view_helper";
import { LANE_WIDTH, LANE_COLOR, SIDEWALK_WIDTH, SIDEWALK_COLOR } from "../constants";

export default class IntersectionView extends ViewElement {
    constructor(private intersection: Intersection, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let worldCoords: Coord[] = this.getSquareWorldCoords();
        let roadCoords: Coord[] = worldCoords.map(c => this.toCanvasCoords(c, viewRect));

        let withSidewalks: Coord[] = padRect(worldCoords, -SIDEWALK_WIDTH);
        let swCoords: Coord[] = withSidewalks.map(c => this.toCanvasCoords(c, viewRect));

        ctx.fillStyle = SIDEWALK_COLOR;
        drawFilledPolygon(swCoords, ctx);

        ctx.fillStyle = LANE_COLOR;
        drawFilledPolygon(roadCoords, ctx);
    }

    private getSquareWorldCoords(): Coord[] {
        let chord: LineSegment = this.intersection.getChord();
        let width: number = LANE_WIDTH * 
            (this.intersection.roads[1].charmLanes + this.intersection.roads[1].strangeLanes);
        return midlineRectCoords(chord, width);
    }
}