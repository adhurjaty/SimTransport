import Coord from "./coord";
import { LineSegment } from "../interfaces/LineSegment";
import { tipTailGrouping } from "../util";

export default class Road {
    constructor(public id: number, public path: Coord[], public charmLanes: number, 
        public strangeLanes: number) {}

    *toLineSegments(): IterableIterator<LineSegment> {
        for(const seg of tipTailGrouping(this.path, 2)) {
            yield <[Coord, Coord]>seg;
        }
    }
}