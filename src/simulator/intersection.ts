import Road from "../models/road";
import TrafficLight from "./traffic_light";
import Coord from "../models/coord";

export default class Intersection {
    public light: TrafficLight;
    constructor(public roads: [Road, Road], public location: Coord) {
        this.light = new TrafficLight(this);
    }
}