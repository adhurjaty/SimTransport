import Road from "../models/road";
import Coord from "../models/coord";
import Intersection from "./intersection";
import { isPointOnLine, getDistance, scaleSegment, dotProduct90CCW, randInt, randDouble } from "../util";
import Address from "./address";
import RoadNetwork from "./road_network";
import { RoadDirection, DrivingDirection } from "../enums";
import Coord from "../interfaces/Coord";
import PathInstruction from "./path_instruction";

export function getRoadDistance(road: Road, from: Coord, to: Coord): number {
    let distanceFinder: RoadDistanceFinder = new RoadDistanceFinder(road, from, to);
    return distanceFinder.getRoadDistance();
}

export function getRoadLength(road: Road): number {
    return getRoadDistance(road, road.path[0], road.path[road.path.length - 1]);
}

export function getRoadDirection(road: Road, from: Coord, to: Coord): RoadDirection {
    if(getRoadDistance(road, road.path[0], from) < 
        getRoadDistance(road, road.path[0], to))
    {
        return RoadDirection.Charm;
    }

    return RoadDirection.Strange;
}

export function getDistBetweenAddresses(addr1: Address, addr2: Address, 
    direction: RoadDirection=undefined): number 
{
    if(addr1.road.id != addr2.road.id) {
        throw new Error("Addresses must be on the same road")
    }

    if(direction == undefined) {
        return Math.abs(addr1.distance - addr2.distance);
    }

    if(direction == RoadDirection.Charm) {
        return addr2.distance - addr1.distance;
    }
    return addr1.distance - addr2.distance;
}

export function getDistToIntersection(addr: Address, int: Intersection): number {
    let road: Road = int.roads.find(x => x.id == addr.road.id);
    if(road == undefined) {
        throw new Error("Intersection is not on the same road");
    }

    let dist = getRoadDistance(road, getCoord(addr), int.location);

    return dist;
}

export function followRoad(addr: Address, distance: number, direction: RoadDirection): 
    Address 
{
    let disp = distance * (direction == RoadDirection.Charm ? 1 : -1);
    let endAddr: Address = new Address(addr.road, addr.distance + disp);
    if(endAddr.distance < 0) {
        endAddr.distance = 0;
        return endAddr;
    }
    
    let roadLen: number = getRoadLength(addr.road);
    if(endAddr.distance > roadLen) {
        endAddr.distance = roadLen;
    }
    
    return endAddr;
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
    return getAddressOnRoad(road, location);
}

export function getAddressOnRoad(road: Road, location: Coord): Address {
    let distance: number = getRoadDistance(road, road.path[0], location);
    return new Address(road, distance);
}

export function getCoord(address: Address): Coord {
    let distance = address.distance;
    for (const seg of address.road.toLineSegments()) {
        let segLength: number = getDistance(seg);
        if(segLength >= distance) {
            let result: Coord = scaleSegment(seg as [Coord, Coord], 
                distance / segLength)[1];
            return new Coord(result.x, result.y);
        }
        distance -= segLength;
    }

    throw new Error("distance exceeds road length");
}

export function getDrivingDirection(inst: PathInstruction, prevInst: PathInstruction): 
    DrivingDirection
{
    let intAddr: Address = getAddressOnRoad(prevInst.road, prevInst.location);
    let prevStartDist: number = intAddr.distance - (prevInst.distance * 
        (prevInst.direction == RoadDirection.Charm ? 1 : -1));
    let prevStartAddr: Address = new Address(intAddr.road, prevStartDist);
    let prevStartCoord: Coord = getCoord(prevStartAddr);
    let prevVec: Coord = new Coord(prevInst.location.x - prevStartCoord.x,
        prevInst.location.y - prevStartCoord.y);
    let curVec: Coord = new Coord(inst.location.x - prevInst.location.x,
        inst.location.y - prevInst.location.y);

    let product: number = dotProduct90CCW(prevVec, curVec);
    
    if(product > 0) {
        return DrivingDirection.Right;
    }
    if(product < 0) {
        return DrivingDirection.Left
    }

    return DrivingDirection.Straight;
}

export function getNewRoadDirection(intAddr: Address, nextAddr: Address): RoadDirection {
    if(intAddr.distance - nextAddr.distance > 0) {
        return RoadDirection.Strange;
    }

    return RoadDirection.Charm;
}

export function getRoadTheta(addr: Address, direction: RoadDirection): number {
    let dist: number = 0;
    for(const seg of addr.road.toLineSegments()) {
        dist += getDistance(seg);
        if(dist >= addr.distance) {
            let vec: Coord = {x: seg[1].x - seg[0].x, y: seg[1].y - seg[0].y};
            let parity: number = direction == RoadDirection.Charm ? 1 : -1;
            return Math.atan2(parity * vec.y, parity * vec.x);
        }
    }
    throw new Error("address is invalid");
}

export function randomAddress(network: RoadNetwork): Address {
    let roadId: number = randInt(network.map.roads.length);
    let road: Road = network.map.roads[roadId];

    let maxDist: number = getRoadLength(road);
    let addr: Address;
    do {
        let distance = randDouble(maxDist);
        addr = new Address(road, distance);
    } while(network.getIntersectionFromAddr(addr) != undefined);

    return addr;
}

export function randomDirection(road: Road): RoadDirection {
    if(road.charmLanes == 0) {
        return RoadDirection.Strange;
    }
    if(road.strangeLanes == 0) {
        return RoadDirection.Charm;
    }

    return randInt(road.charmLanes + road.strangeLanes) < road.charmLanes 
        ? RoadDirection.Charm : RoadDirection.Strange;
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