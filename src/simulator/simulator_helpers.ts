import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, getDistance, PriorityQueue } from "../util";
import Address from "./address";
import RoadNetwork from "./road_network";
import NavPath from "./nav_path";
import { number } from "prop-types";

export function getRoadDistance(road: Road, from: Coord, to: Coord): number {
    let distanceFinder: RoadDistanceFinder = new RoadDistanceFinder(road, from, to);
    return distanceFinder.getRoadDistance();
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

export function findPath(network: RoadNetwork, source: Coord, dest: Coord): NavPath {
    let startAddr: Address = getAddress(network, source);
    let endAddr: Address = getAddress(network, dest);

    let frontier: PriorityQueue<AStarNodeElement> = 
        new PriorityQueue<AStarNodeElement>((a) => a.value);
    let intersectionCost: Map<number, number> = new Map<number, number>();
    let startIntersections: Intersection[] = network.getNearestIntersections(source);
    let endIntersections: Intersection[] = network.getNearestIntersections(dest);

    for (const int of startIntersections) {
        let d: number = getRoadDistance(startAddr.road, source, int.location);
        let h: number = distHeuristic(source, dest);
        frontier.push(new AStarNodeElement(d + h, d, [int], startAddr.road));
        intersectionCost.set(network.getIntersectionID(int), d);
    }

    while(!frontier.empty()) {
        let curNode: AStarNodeElement = frontier.pop();
        let curIntersection: Intersection = curNode.path[curNode.path.length - 1];

        for(const int of endIntersections) {
            if(curIntersection.equals(int)) {
                let path: Intersection[] = curNode.path;
                return new NavPath(startAddr, path, endAddr);
            }
        }

        let neighbors: Intersection[] = network.getNearestIntersections(curIntersection);
        for (const neighbor of neighbors) {
            let d: number = getRoadDistance(curNode.road, curIntersection.location,
                neighbor.location) + curNode.cost;
            let neighborID: number = network.getIntersectionID(neighbor)
            if(d < (intersectionCost.get(neighborID) || Infinity))
            {
                intersectionCost.set(neighborID, d);
                let h: number = distHeuristic(neighbor.location, dest);
                let newPath: Intersection[] = curNode.path.concat([neighbor]);
                let newRoad: Road = getConnectingRoad(curIntersection, neighbor);
                frontier.push(new AStarNodeElement(d + h, d, newPath, newRoad));
            }
        }
    }

    throw new Error('No path from source to destination');
}

function distHeuristic(source: Coord, dest: Coord) {
    return source.distance(dest);
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

class AStarNodeElement {
    constructor(public value: number, public cost: number, public path: Intersection[], 
        public road: Road) 
    {

    }
}