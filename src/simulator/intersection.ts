import Road from "../models/road";
import TrafficLight from "./traffic_light";

export default class Intersection {
    public light: TrafficLight;
    constructor(public roads: [Road, Road]) {
        this.light = new TrafficLight(this);
    }
}