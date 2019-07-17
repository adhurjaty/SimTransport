import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, getDistance, scaleSegment } from "../util";
import Address from "./address";
import RoadNetwork from "./road_network";
import { RoadDirection } from "../enums";
import ICoord from "../interfaces/ICoord";

export function getRoadDistance(road: Road, from: Coord, to: Coord): number {
    let distanceFinder: RoadDistanceFinder = new RoadDistanceFinder(road, from, to);
    return distanceFinder.getRoadDistance();
}

export function getRoadDirection(road: Road, from: Coord, to: Coord): RoadDirection {
    if(getRoadDistance(road, road.path[0], from) < 
        getRoadDistance(road, road.path[0], to))
    {
        return RoadDirection.Charm;
    }

    return RoadDirection.Strange;
}

export function getConnectingRoad(fromInt: Intersection, toInt: Intersection): Road {
    let road: Road = fromInt.roads.find(r => 
        toInt.roads.map(t => t.id).indexOf(r.id) != -1);
    
    if(!road) {
        return undefined;
    }

    let isCharm: boolean = getRoadDistance(road, road.path[0], fromInt.location) <
        getRoadDistance(road, road.path[0], toInt.location);
    if((isCharm && road.charmLanes == 0) || (!isCharm && road.strangeLanes == 0)) {
        return undefined
    }
    return road;
}

export function getAddress(network: RoadNetwork, location: Coord): Address {
    let road: Road = network.getRoad(location);
    let distance: number = getRoadDistance(road, road.path[0], location);
    return new Address(road, distance);
}

export function getCoord(address: Address): Coord {
    let distance = address.distance;
    for (const seg of address.road.toLineSegments()) {
        let segLength: number = getDistance(seg);
        if(segLength >= distance) {
            let result: ICoord = scaleSegment(seg as [Coord, Coord], 
                distance / segLength)[1];
            return new Coord(result.x, result.y);
        }
        distance -= segLength;
    }

    throw new Error("distance exceeds road length");
}

class RoadDistanceFinder {
    private pointsToCheck: Coord[];
    constructor(private road: Road, from: Coord, to: Coord) {
        this.pointsToCheck = [from, to];
    }

    getRoadDistance(): number {
        let distance: number = 0;
        for (const seg of this.road.toLineSegments()) {
            let d: number = this.getSegmentDistance(seg as [Coord, Coord]);
            distance += d;
            if(this.isPathDone()) {
                return distance;
            }
        }
        throw new Error("One or both points are not on the road");
    }

    private getSegmentDistance(line: [Coord, Coord]): number {
        for (let i = 0; i < this.pointsToCheck.length; i++) {
            const p = this.pointsToCheck[i];

            if(isPointOnLine(line, p)) {
                this.pointsToCheck.splice(i, 1);
                let partialSegment: [Coord, Coord] = this.isPathDone()
                    ? [line[0], p]
                    : [p, line[1]]; 
                return this.getSegmentDistance(partialSegment);
            }
        }

        return this.shouldAccumDistance() ? getDistance(line) : 0;
    }

    private shouldAccumDistance(): boolean {
        return this.pointsToCheck.length <= 1;
    }

    private isPathDone(): boolean {
        return this.pointsToCheck.length == 0;
    }
}