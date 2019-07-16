import RoadNetwork from "./road_network";
import Coord from "../models/coord";
import Address from "./address";
import { getAddress, getRoadDistance, getConnectingRoad } from "./simulator_helpers";
import Intersection from "./intersection";
import { PriorityQueue } from "../util";
import NavPath from "./nav_path";
import Road from "../models/road";

const LEFT_TURN_COST: number = .05;
const RIGHT_TURN_COST: number = .01;

export default class PathFinder {
    constructor(private network: RoadNetwork) {

    }

    getPath(source: Coord, dest: Coord) {
        let startAddr: Address = getAddress(this.network, source);
        let endAddr: Address = getAddress(this.network, dest);

        let frontier: PriorityQueue<AStarNodeElement> = 
            new PriorityQueue<AStarNodeElement>((a) => a.value);
        let intersectionCost: Map<number, number> = new Map<number, number>();
        let startIntersections: Intersection[] = 
            this.network.getNearestIntersections(source);
        let endIntersections: Intersection[] = 
            this.network.getNearestIntersections(dest);

        for (const int of startIntersections) {
            let d: number = getRoadDistance(startAddr.road, source, int.location);
            let h: number = this.distHeuristic(source, dest);
            frontier.push(new AStarNodeElement(d + h, d, [int], startAddr.road));
            intersectionCost.set(this.network.getIntersectionID(int), d);
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

            let neighbors: Intersection[] = 
                this.network.getNearestIntersections(curIntersection);
            for (const neighbor of neighbors) {
                let connectingRoad: Road = getConnectingRoad(curIntersection, neighbor);
                let d: number = getRoadDistance(connectingRoad, curIntersection.location,
                    neighbor.location) + curNode.cost;
                let neighborID: number = this.network.getIntersectionID(neighbor)
                if(d < (intersectionCost.get(neighborID) || Infinity))
                {
                    intersectionCost.set(neighborID, d);
                    let h: number = this.distHeuristic(neighbor.location, dest);
                    let newPath: Intersection[] = curNode.path.concat([neighbor]);
                    let newRoad: Road = getConnectingRoad(curIntersection, neighbor);
                    frontier.push(new AStarNodeElement(d + h, d, newPath, newRoad));
                }
            }
        }

        throw new Error('No path from source to destination');
    }

    private distHeuristic(source: Coord, dest: Coord) {
        return source.distance(dest);
    }
}

class AStarNodeElement {
    constructor(public value: number, public cost: number, public path: Intersection[], 
        public road: Road) 
    {

    }
}