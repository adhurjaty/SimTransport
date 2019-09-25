import RoadNetwork from "./road_network";
import { Coord } from "../util";
import Address from "./address";
import { getAddress, getRoadDistance, getConnectingRoad, getRoadDirection, getDrivingDirection } from "./simulator_helpers";
import Intersection from "./intersection";
import { PriorityQueue, last } from "../util";
import Road from "../models/road";
import PathInstruction from "./path_instruction";
import { RoadDirection, DrivingDirection } from "../enums";

const LEFT_TURN_COST: number = .05;
const RIGHT_TURN_COST: number = .01;
const INSTRUCTION_COST: number = .005;

const TURN_COSTS: {[k: number]: number; } = {
    0: LEFT_TURN_COST,
    1: RIGHT_TURN_COST,
    2: INSTRUCTION_COST, 
};

export default class PathFinder {
    private frontier: PriorityQueue<AStarNodeElement>;
    private intersectionCost: Map<number, number>;
    private ends: Coord[];
    private endAddrs: Address[];

    constructor(private network: RoadNetwork) {

    }

    getPath(source: Coord, dest: Coord): PathInstruction[] {
        return this.getClosestPath(source, [dest]);
    }

    getClosestPath(source: Coord, dests: Coord[]): PathInstruction[] {
        this.frontier = new PriorityQueue<AStarNodeElement>((a) => a.value);
        this.intersectionCost = new Map<number, number>();
        this.ends = dests;
        this.endAddrs = dests.map(dest => getAddress(this.network, dest));

        let startAddr: Address = getAddress(this.network, source);

        let startIntersections: IterableIterator<Intersection> = 
            this.network.getIntersectionsOnRoad(startAddr.road);
        let endIntersections: Intersection[][] = 
            this.getIntersectionMapping(this.endAddrs);

        // edge-case: if the source and dest are on the same road - just follow the road
        for (const nodeElement of this.getStraightShots(startAddr, source)) {
            this.frontier.push(nodeElement);
        }

        for (const int of startIntersections) {
            this.visitNode(startAddr.road, int, source);
        }

        while(!this.frontier.empty()) {
            let curNode: AStarNodeElement = this.frontier.pop();
            let curIntersection: Intersection = curNode.intersection;

            if(this.atDest(last(curNode.path))) {
                return curNode.path;
            }
            if(curNode != undefined) {
                let endIdxs = this.adjacentDestIdxs(endIntersections, curIntersection);
                for (const idx of endIdxs) {
                    this.visitDest(curIntersection, curNode, this.endAddrs[idx],
                        this.ends[idx]);
                }
            }

            let neighbors: IterableIterator<Intersection> = 
                this.network.getConnectedIntersections(curIntersection);
            for (const neighbor of neighbors) {
                let connectingRoad: Road = getConnectingRoad(curIntersection, neighbor);
                this.visitNode(connectingRoad, neighbor, curIntersection.location, 
                    curNode);
            }
        }

        throw new Error('No path from source to destination');
    }

    private getIntersectionMapping(addrs: Address[]): Intersection[][] 
    {
        return addrs.map(addr => {
            return Array.from(this.network.getIntersectionsOnRoad(addr.road));
        });
    }

    private *getStraightShots(startAddr: Address, source: Coord): IterableIterator<AStarNodeElement> {
        let i: number = 0;
        for (const endAddr of this.endAddrs) {
            if(startAddr.road.id == endAddr.road.id) {
                let instruction: PathInstruction = this.createInstruction(startAddr.road, 
                    source, this.ends[i]);
                yield new AStarNodeElement(instruction.distance,
                    instruction.distance, [instruction], undefined);
            }

            i++;
        }
    }

    private atDest(pathEnd: PathInstruction): boolean {
        return this.ends.find(end => pathEnd.location.equals(end)) != undefined;
    }

    private adjacentDestIdxs(endInts: Intersection[][], intersection: Intersection): number[] {
        return endInts.map(eis => eis.indexOf(intersection)).filter(x => x > -1);
    }

    private visitNode(road: Road, node: Intersection, source: Coord,
        curNode: AStarNodeElement = undefined): AStarNodeElement 
    {
        let instruction: PathInstruction = this.createInstruction(road, source, 
            node.location);
        let totalCost: number = instruction.distance;
        if(curNode) {
            totalCost += curNode.cost;
            let turn: DrivingDirection = getDrivingDirection(instruction, 
                last(curNode.path));
            totalCost += TURN_COSTS[turn];
        }
        let path: PathInstruction[] = curNode ? curNode.path.concat([instruction]) 
            : [instruction];

        let intID: number = node.id;
        if(totalCost < (this.intersectionCost.get(intID) || Infinity)) {
            let h: number = this.distHeuristic(source);
            let newNode = new AStarNodeElement(totalCost + h, totalCost, path, node);
            this.frontier.push(newNode);
            this.intersectionCost.set(node.id, 
                totalCost);
            return newNode;
        }

        return undefined;
    }

    private createInstruction(road: Road, source: Coord, dest: Coord): PathInstruction {
        let d: number = getRoadDistance(road, source, dest);
        let direction: RoadDirection = getRoadDirection(road, source, dest);
        return new PathInstruction(road, direction, d, dest);
    }

    private visitDest(int: Intersection, node: AStarNodeElement, endAddr: Address,
        end: Coord) 
    {
        let instruction: PathInstruction = this.createInstruction(endAddr.road,
            int.location, end);
        let totalCost = instruction.distance + node.cost + INSTRUCTION_COST;
        let path: PathInstruction[] = node.path.concat([instruction]);

        this.frontier.push(new AStarNodeElement(totalCost, totalCost, path, int));
    }

    private distHeuristic(source: Coord): number {
        return Math.min(...this.ends.map(end => source.distance(end)));
    }
}

class AStarNodeElement {
    constructor(public value: number, public cost: number, 
        public path: PathInstruction[], public intersection: Intersection) 
    {

    }
}