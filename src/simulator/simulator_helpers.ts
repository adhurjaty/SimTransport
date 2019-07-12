import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, intersectionGrouping, getDistance } from "../util";
import { LineSegment } from "../interfaces/LineSegment"

export function getRoadDistance(road: Road, from: Coord, to: Coord): number {
    let pointsToCheck: Coord[] = [from, to];
    let distance: number = 0;
    for (const seg of intersectionGrouping(road.path, 2)) {
        let [newDist, idx] = getSegmentDistance(seg as [Coord, Coord], pointsToCheck);
        distance += newDist;
        if(idx > -1) {
            pointsToCheck = pointsToCheck.splice(idx, 1);
        }
        if(pointsToCheck.length == 0) {
            return distance;
        }
    }

    throw new Error("One or both points are not on the road");
}

// returns the distance and the index of the matching point.
// returns 0 distance if there are 2 points and no match
// returns -1 index if no match
// accumulates distance while there's only 1 point
function getSegmentDistance(seg: LineSegment, pointsToCheck: Coord[]): [number, number] {
    for (let i = 0; i < pointsToCheck.length; i++) {
        const p = pointsToCheck[i];
        if(isPointOnLine(seg as [Coord, Coord], p)) {
            if(pointsToCheck.length == 2) {
                return [getDistance([seg[0], p]), i];
            }
            return [getDistance([p, seg[1]]), i];
        }
    }

    if(pointsToCheck.length == 2) {
        return [0, -1];
    }
    return [getDistance(seg), -1];
}

export function getConnectingRoad(fromInt: Intersection, toInt: Intersection): Road {
    return undefined;
}