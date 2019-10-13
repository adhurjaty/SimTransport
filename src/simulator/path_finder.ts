import RoadNetwork from "./road_network";
import { Coord, remove } from "../util";
import Address from "./address";
import { getAddress, getRoadDistance, getRoadDirection, getDrivingDirection, getCoord, getAddressOnRoad } from "./simulator_helpers";
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
    constructor(private network: RoadNetwork) {

    }

    getPath(source: Coord, dest: Coord): PathInstruction[] {
        return this.getClosestPath(source, [dest]);
    }

    getClosestPath(source: Coord, dests: Coord[]): PathInstruction[] {
        let frontier: PriorityQueue<PrelimPathState> = 
            new PriorityQueue<PrelimPathState>((a) => a.value);
        let visited: AStarNode[] = [];
        let ends: DestNode[] = dests.map(d => 
            new DestNode(Location.fromCoord(this.network, d)));
        let startNode: StartNode = new StartNode(Location.fromCoord(this.network, source), 
            this.network);

        frontier.push(new PrelimPathState(startNode, ends));
        visited.push(startNode);

        while(!frontier.empty()) {
            let curState = frontier.pop();

            if(curState.isGoal()) {
                return curState.path;
            }

            let neighbors: AStarNode[] = curState.node.getNeighbors(ends);
            for (const node of neighbors) {
                if(visited.find(x => x.equals(node))) {
                    continue;
                }
                let newState = curState.copy();
                newState.add(node);
                frontier.push(newState);
                visited.push(node);
            }
        }

        throw new Error('No path from source to destination');
    }

    getShortestRoute(source: Coord, dests: Coord[]): PathInstruction[] {
        let path: PathInstruction[] = [];
        let remainingDests: Coord[] = Object.assign([], dests);
        for (let _ = 0; _ < dests.length; _++) {
            path = path.concat(this.getClosestPath(source, remainingDests))
            let dest: Coord = last(path).location;
            remove(remainingDests, dest)
        }

        return path;
    }
}

class PrelimPathState {
    public value: number; 
    public cost: number;
    public path: PathInstruction[];

    constructor(public node: AStarNode, public dests: DestNode[]) {
        this.path = [];
        this.cost = 0;
        this.value = this.distHeuristic(node);
    }

    copy(): PrelimPathState {
        let output = new PrelimPathState(this.node, this.dests);
        output.value = this.value;
        output.cost = this.cost;
        output.path = this.path.map(x => x.copy());

        return output;
    }

    add(newNode: AStarNode): void {
        let instruction: PathInstruction = this.createInstruction(newNode);
        this.cost += instruction.distance;
        if(this.path.length > 1) {
            let lastInst: PathInstruction = last(this.path);
            let turn: DrivingDirection = getDrivingDirection(instruction, lastInst);
            this.cost += TURN_COSTS[turn];
        }
        this.path.push(instruction);

        let heuristic: number = this.distHeuristic(newNode);
        this.value = this.cost + heuristic;

        this.node = newNode;
    }

    private createInstruction(newNode: AStarNode): PathInstruction {
        let connectingRoad: Road = this.node.getLinks().find(r => 
            newNode.getLinks().find(nr => r.id == nr.id));
        let d: number = getRoadDistance(connectingRoad, this.node.location.coord,
            newNode.location.coord);
        let direction: RoadDirection = getRoadDirection(connectingRoad,
            this.node.location.coord, newNode.location.coord);
        return new PathInstruction(connectingRoad, direction, d, newNode.location.coord);
    }

    private distHeuristic(newNode: AStarNode): number {
        return Math.min(...this.dests.map(dest => 
            newNode.location.coord.distance(dest.location.coord)));
    }

    isGoal(): boolean {
        return this.node instanceof DestNode; 
    }
}

interface AStarNode {
    location: Location;
    getNeighbors(dests: AStarNode[]): AStarNode[];
    getLinks(): Road[];
    equals(other: AStarNode): boolean;
}

function getNeighborsFromAddress(address: Address, network: RoadNetwork, dests: AStarNode[]): 
    AStarNode[] 
{
    let intersections: Intersection[] = Array.from(
        network.getIntersectionsFromAddress(address));
        
    let nodes: AStarNode[] = intersections.map(x => 
        new IntersectionNode(x, network));
    
    let destsOnRoad = dests.filter(d => address.road.id == d.location.address.road.id);
    nodes = nodes.concat(destsOnRoad.map(x => 
        new DestNode(x.location)));

    return nodes;
}

class IntersectionNode {
    public location: Location;
    constructor(private intersection: Intersection, private network: RoadNetwork) {
        this.location = Location.fromCoord(network, intersection.location);
    }

    getNeighbors(dests: AStarNode[]): AStarNode[] {
        return this.intersection.roads.reduce((lst, road) => {
            let addr: Address = getAddressOnRoad(road, this.intersection.location);
            return lst.concat(getNeighborsFromAddress(addr, this.network, dests));
        }, []);
    }

    getLinks(): Road[] {
        return this.intersection.roads;
    }

    equals(other: AStarNode): boolean {
        let intersection = (other as IntersectionNode).intersection;
        return intersection && intersection.id == this.intersection.id;
    }
}

class DestNode {
    constructor(public location: Location) {

    }

    getNeighbors(dests: AStarNode[]): AStarNode[] {
        return [];
    }

    getLinks(): Road[] {
        return [this.location.address.road];
    }

    equals(other: AStarNode): boolean {
        return other.location.coord.equals(this.location.coord) && 
            (other instanceof DestNode);
    }
}

class StartNode {
    constructor(public location: Location, private network: RoadNetwork) {
    }

    getNeighbors(dests: AStarNode[]): AStarNode[] {
        return getNeighborsFromAddress(this.location.address, this.network, dests);
    }

    getLinks(): Road[] {
        return [this.location.address.road];
    }

    equals(other: AStarNode): boolean {
        return false;
    }
}


class Location {
    static fromCoord(network: RoadNetwork, coord: Coord): Location {
        let addr: Address = getAddress(network, coord);
        return new Location(addr, coord);
    }

    static fromAddress(addr: Address): Location {
        let coord: Coord = getCoord(addr)
        return new Location(addr, coord);
    }

    constructor(public address: Address, public coord: Coord) {}

    copy(): Location {
        return Location.fromAddress(this.address);
    }
}