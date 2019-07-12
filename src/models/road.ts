import Coord from "./coord";

export default class Road {
    constructor(public id: number, public path: Coord[], public charmLanes: number, 
        public strangeLanes: number) {}
}