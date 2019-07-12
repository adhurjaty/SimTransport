import Coords from "./coord";

export default class Road {
    constructor(public id: number, public path: Coords[], public charmLanes: number, 
        public strangeLanes: number) {}
}