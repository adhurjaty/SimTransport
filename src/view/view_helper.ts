import { LineSegment } from "../interfaces/LineSegment";
import Coord from "../interfaces/Coord";

export function offsetLine(seg: LineSegment, dist: number): LineSegment {
    let perpVec: Coord = findPerpVec(seg, dist);
    return [
        {x: seg[0].x + perpVec.x, y: seg[0].y + perpVec.y},
        {x: seg[1].x + perpVec.x, y: seg[1].y + perpVec.y}
    ];
}

export function midlineRectCoords(seg: LineSegment, width: number): 
    [Coord, Coord, Coord, Coord] 
{
    let perpVec: Coord = findPerpVec(seg, width / 2);

    return [
        {x: seg[1].x + perpVec.x, y: seg[1].y + perpVec.y},
        {x: seg[1].x - perpVec.x, y: seg[1].y - perpVec.y},
        {x: seg[0].x - perpVec.x, y: seg[0].y - perpVec.y},
        {x: seg[0].x + perpVec.x, y: seg[0].y + perpVec.y}
    ];
}

function findPerpVec(seg: LineSegment, dist: number): Coord {
    let vector: Coord = {x: seg[1].x - seg[0].x, y: seg[1].y - seg[0].y};
    let factor: number = dist * Math.sqrt(1 / (vector.x**2 + vector.y**2));
    return {
        x: -vector.y * factor,
        y: vector.x * factor
    };
}

export function drawFilledPolygon(coords: Coord[], ctx: CanvasRenderingContext2D):  void {
    ctx.beginPath();
    ctx.moveTo(coords[0].x, coords[0].y);
    for (const c of coords.slice(1)) {
        ctx.lineTo(c.x, c.y);
    }
    ctx.fill();
}