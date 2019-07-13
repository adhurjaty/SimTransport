import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, tipTailGrouping, getDistance } from "../util";
import { LineSegment } from "../interfaces/LineSegment"

export function getRoadDistance(road: Road, from: Coord, to: Coord): number {
    let distanceFinder: RoadDistanceFinder = new RoadDistanceFinder(road, from, to);
    return distanceFinder.getRoadDistance();
}

export function getConnectingRoad(fromInt: Intersection, toInt: Intersection): Road {
    return undefined;
}

class RoadDistanceFinder {
    private pointsToCheck: Coord[];
    constructor(private road: Road, from: Coord, to: Coord) {
        this.pointsToCheck = [from, to];
    }

    getRoadDistance(): number {
        let distance: number = 0;
        for (const seg of tipTailGrouping(this.road.path, 2)) {
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