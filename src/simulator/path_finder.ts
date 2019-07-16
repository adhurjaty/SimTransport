import RoadNetwork from "./road_network";
import Coord from "../models/coord";
import Address from "./address";
import { getAddress, getRoadDistance, getConnectingRoad, getRoadDirection } from "./simulator_helpers";
import Intersection from "./intersection";
import { PriorityQueue, last } from "../util";
import Road from "../models/road";
import PathInstruction from "./path_instruction";
import { RoadDirection } from "../enums";

const LEFT_TURN_COST: number = .05;
const RIGHT_TURN_COST: number = .01;
const INSTRUCTION_COST: number = .005;

export default class PathFinder {
    private frontier: PriorityQueue<AStarNodeElement>;
    private intersectionCost: Map<number, number>;
    private end: Coord;
    private endAddr: Address;

    constructor(private network: RoadNetwork) {

    }

    getPath(source: Coord, dest: Coord): PathInstruction[] {
        this.frontier = new PriorityQueue<AStarNodeElement>((a) => a.value);
        this.intersectionCost = new Map<number, number>();
        this.end = dest;
        this.endAddr = getAddress(this.network, dest);

        let startAddr: Address = getAddress(this.network, source);

        let startIntersections: IterableIterator<Intersection> = 
            this.network.getIntersectionsOnRoad(startAddr.road);
        let endIntersections: Intersection[] = Array.from(
            this.network.getIntersectionsOnRoad(this.endAddr.road));

        // edge-case: if the source and dest are on the same road - just follow the road
        // with more complicated roads, this may be undesirable
        if(startAddr.road.id == this.endAddr.road.id) {
            return [this.createInstruction(startAddr.road, source, dest)];
        }

        for (const int of startIntersections) {
            this.visitNode(startAddr.road, int, source);
        }

        while(!this.frontier.empty()) {
            let curNode: AStarNodeElement = this.frontier.pop();
            let curIntersection: Intersection = curNode.intersection;

            if(last(curNode.path).location.equals(this.end)) {
                return curNode.path;
            }

            let neighbors: IterableIterator<Intersection> = 
                this.network.getConnectedIntersections(curIntersection);
            for (const neighbor of neighbors) {
                let connectingRoad: Road = getConnectingRoad(curIntersection, neighbor);
                let newNode: AStarNodeElement = this.visitNode(connectingRoad, 
                    neighbor, curIntersection.location, curNode);

                if(endIntersections.indexOf(neighbor) != -1 && newNode != undefined) {
                    this.visitDest(neighbor, newNode);
                }
            }
        }

        throw new Error('No path from source to destination');
    }

    private visitNode(road: Road, node: Intersection, source: Coord,
        curNode: AStarNodeElement = undefined): AStarNodeElement 
    {
        let instruction: PathInstruction = this.createInstruction(road, source, 
            node.location);
        let totalCost: number = instruction.distance;
        if(curNode) {
            totalCost += curNode.cost;
            totalCost += INSTRUCTION_COST;
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

    private visitDest(int: Intersection, node: AStarNodeElement) {
        let instruction: PathInstruction = this.createInstruction(this.endAddr.road,
            int.location, this.end);
        let totalCost = instruction.distance + node.cost + INSTRUCTION_COST;
        let path: PathInstruction[] = node.path.concat([instruction]);

        this.frontier.push(new AStarNodeElement(totalCost, totalCost, path, int));
    }

    private distHeuristic(source: Coord): number {
        return source.distance(this.end);
    }
}

class AStarNodeElement {
    constructor(public value: number, public cost: number, 
        public path: PathInstruction[], public intersection: Intersection) 
    {

    }
}