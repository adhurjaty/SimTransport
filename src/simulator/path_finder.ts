import RoadNetwork from "./road_network";
import Coord from "../models/coord";
import Address from "./address";
import { getAddress, getRoadDistance, getConnectingRoad, getRoadDirection } from "./simulator_helpers";
import Intersection from "./intersection";
import { PriorityQueue } from "../util";
import Road from "../models/road";
import PathInstruction from "./path_instruction";
import { RoadDirection } from "../enums";

const LEFT_TURN_COST: number = .05;
const RIGHT_TURN_COST: number = .01;

export default class PathFinder {
    private frontier: PriorityQueue<AStarNodeElement>;
    private intersectionCost: Map<number, number>;
    private end: Coord;

    constructor(private network: RoadNetwork) {

    }

    getPath(source: Coord, dest: Coord): PathInstruction[] {
        let startAddr: Address = getAddress(this.network, source);
        let endAddr: Address = getAddress(this.network, dest);

        this.frontier = new PriorityQueue<AStarNodeElement>((a) => a.value);
        this.intersectionCost = new Map<number, number>();
        this.end = dest;

        let startIntersections: Intersection[] = 
            this.network.getNearestIntersections(source);
        let endIntersections: Intersection[] = 
            this.network.getNearestIntersections(dest);

        for (const int of startIntersections) {
            this.visitNode(startAddr.road, int, source);
        }

        while(!this.frontier.empty()) {
            let curNode: AStarNodeElement = this.frontier.pop();
            let curIntersection: Intersection = curNode.intersection;

            for(const int of endIntersections) {
                if(curIntersection.equals(int)) {
                    let path: PathInstruction[] = curNode.path;
                    let instruction: PathInstruction = this.createInstruction(
                        endAddr.road, int.location, dest);
                    path.push(instruction);
                    return path;
                }
            }

            let neighbors: Intersection[] = 
                this.network.getNearestIntersections(curIntersection);
            for (const neighbor of neighbors) {
                let connectingRoad: Road = getConnectingRoad(curIntersection, neighbor);
                this.visitNode(connectingRoad, neighbor, curIntersection.location,
                    curNode);

            }
        }

        throw new Error('No path from source to destination');
    }

    private visitNode(road: Road, node: Intersection, source: Coord,
        curNode: AStarNodeElement = undefined): void 
    {
        let instruction: PathInstruction = this.createInstruction(road, source, 
            node.location);
        let totalDistance: number = instruction.distance + (curNode ? curNode.cost: 0);
        let path: PathInstruction[] = curNode ? curNode.path.concat([instruction]) 
            : [instruction];

        let intID: number = this.network.getIntersectionID(node);
        if(totalDistance < (this.intersectionCost.get(intID) || Infinity)) {
            let h: number = this.distHeuristic(source);
            this.frontier.push(new AStarNodeElement(totalDistance + h, totalDistance,
                path, node));
            this.intersectionCost.set(this.network.getIntersectionID(node), 
                totalDistance);
        }
    }

    private createInstruction(road: Road, source: Coord, dest: Coord): PathInstruction {
        let d: number = getRoadDistance(road, source, dest);
        let direction: RoadDirection = getRoadDirection(road, source, dest);
        return new PathInstruction(road, direction, d, dest);
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