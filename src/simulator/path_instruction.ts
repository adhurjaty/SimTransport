import Road from "../models/road";
import { RoadDirection } from "../enums";
import Coord from "../models/coord";

export default class PathInstruction {
    constructor(public road: Road, public direction: RoadDirection, 
        public distance: number, public location: Coord) {

    }
}