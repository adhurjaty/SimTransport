import { LineSegment } from "../interfaces/LineSegment";
import ICoord from "../interfaces/ICoord";

export function midlineRectCoords(seg: LineSegment, width: number): 
    [ICoord, ICoord, ICoord, ICoord] 
{
    let vector: ICoord = {x: seg[1].x - seg[0].x, y: seg[1].y - seg[0].y};
    let factor: number = width / 2 * Math.sqrt(1 / (vector.x**2 + vector.y**2));
    let perpVec: ICoord = {
        x: -vector.y * factor,
        y: vector.x * factor
    };

    return [
        {x: seg[1].x + perpVec.x, y: seg[1].x + perpVec.y},
        {x: seg[1].x - perpVec.x, y: seg[1].x - perpVec.y},
        {x: seg[0].x - perpVec.x, y: seg[0].x - perpVec.y},
        {x: seg[0].x + perpVec.x, y: seg[0].x + perpVec.y}
    ];
}