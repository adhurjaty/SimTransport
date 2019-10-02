import Road from "../models/road";
import { RoadDirection } from "../enums";
import { Coord } from "../util";

export default class PathInstruction {
    constructor(public road: Road, public direction: RoadDirection, 
        public distance: number, public location: Coord) {

    }

    copy(): PathInstruction {
        return new PathInstruction(this.road, this.direction, this.distance, 
            this.location.copy());
    }
}