import Road from "../models/road";
import TrafficLight from "./traffic_light";
import { Coord } from "../util";
import { LineSegment } from "../interfaces/LineSegment";
import { getAddressOnRoad, getCoord } from "./simulator_helpers";
import Address from "./address";
import {  LANE_WIDTH } from "../constants";

export default class Intersection {
    public light: TrafficLight;
    constructor(public id: number, public roads: [Road, Road], public location: Coord) {
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

    getChord(): LineSegment {
        let road: Road = this.roads[0];
        
        let width: number = LANE_WIDTH * 
            (this.roads[1].charmLanes + this.roads[1].strangeLanes);

        let roadAddress: Address = getAddressOnRoad(road, this.location);
        return [
            getCoord(new Address(road, roadAddress.distance - width / 2)),
            getCoord(new Address(road, roadAddress.distance + width / 2))
        ]
    }
}