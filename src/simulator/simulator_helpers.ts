import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, getDistance, PriorityQueue } from "../util";
import Address from "./address";
import RoadNetwork from "./road_network";
import { RoadDirection } from "../enums";

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

    getSegmentDistance(line: [Coord, Coord]): number {
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

    shouldAccumDistance(): boolean {
        return this.pointsToCheck.length <= 1;
    }

    isPathDone(): boolean {
        return this.pointsToCheck.length == 0;
    }
}