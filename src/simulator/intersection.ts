import Road from "../models/road";
import TrafficLight from "./traffic_light";
import Coord from "../models/coord";

export default class Intersection {
    public light: TrafficLight;
    constructor(public roads: [Road, Road], public location: Coord) {
        this.light = new TrafficLight(this);
    }

    equals(other: Intersection): boolean {
        return this.location.equals(other.location) 
            && this.roads[0].id == other.roads[0].id
            && this.roads[1].id == other.roads[1].id;
    }

    hasRoad(road: Road): boolean {
        return this.roads.find(x => x.id == road.id) != undefined;
    }
}