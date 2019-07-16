import RoadMap from "../models/road_map";
import Intersection from "./intersection";
import Road from "../models/road";
import Coord from "../models/coord";
import { segmentsIntersect, isPointOnLine } from "../util";
import ICoord from "../interfaces/ICoord";
import { getConnectingRoad, getRoadDistance, getAddress } from "./simulator_helpers";
import Address from "./address";

const fillValue: number = -1;

export default class RoadNetwork {
    public intersections: Intersection[];
    public connections: number[][];

    constructor(public map: RoadMap) {
        this.initialize();
    }

    initialize() {
        this.createIntersections();
        this.createNetwork();
    }

    createIntersections() {
        this.intersections = [];
        for (let i = 0; i < this.map.roads.length; i++) {
            let road = this.map.roads[i];
            for (const otherRoad of this.map.roads.slice(i+1)) {
                let coord: Coord = this.intersects(road, otherRoad);
                if(coord != undefined) {
                    this.intersections.push(new Intersection([road, otherRoad], coord));
                }
            }
        }
    }

    intersects(road: Road, otherRoad: Road): Coord {
        for (const seg of road.toLineSegments()) {
            for (const other of otherRoad.toLineSegments()) {
                let coord: ICoord = segmentsIntersect(seg as [Coord, Coord],
                    other as [Coord, Coord]) 
                if(coord != undefined) {
                    return new Coord(coord.x, coord.y);
                }
            }
        }

        return undefined;
    }

    createNetwork() {
        // network is a 2-D array of road lengths from intersection to intersection
        // y-axis is the 'from' intersection and x is the 'to' intersection
        this.connections = Array.from(Array(this.intersections.length), _ => 
            Array(this.intersections.length).fill(fillValue));

        for (let y = 0; y < this.intersections.length; y++) {
            for (let x = y; x < this.intersections.length; x++) {
                if(y == x) {
                    this.connections[y][x] = 0;
                    continue;
                }
                let fromInt: Intersection = this.intersections[y];
                let toInt: Intersection = this.intersections[x];
                this.addConnection(fromInt, toInt, x, y);
                this.addConnection(toInt, fromInt, y, x);
            }
        }
    }

    addConnection(fromInt: Intersection, toInt: Intersection, x: number, y: number) {
        let connectingRoad: Road = getConnectingRoad(fromInt, toInt);
        if(connectingRoad != undefined) {
            this.connections[y][x] = getRoadDistance(connectingRoad, 
                fromInt.location, toInt.location);
        }
    }

    getIntersection(roadID: number, otherID: number): Intersection {
        let hasRoad: (id: number, int: Intersection) => boolean = (id, int) => {
            return int.roads.find(x => x.id == id) != undefined;
        } 
        return this.intersections.find(x => hasRoad(roadID, x) && hasRoad(otherID, x));
    }

    getRoad(location: Coord): Road {
        for (const road of this.map.roads) {
            for (const seg of road.toLineSegments()) {
                if(isPointOnLine(seg, location)) {
                    return road;
                }
            }
        }

        throw new Error("Point is not on any road");
    }

    getNearestIntersections(loc: Coord | Intersection): Intersection[] {
        if((loc as Intersection).location == undefined) {
            let location: Coord = <Coord>loc;
            let address: Address = getAddress(this, location);
            let intersections: Intersection[] = 
                Array.from(this.getIntersectionsOnRoad(address.road));
            let diffs: number[] = intersections.map(x => 
                getRoadDistance(address.road, address.road.path[0], x.location) 
                - address.distance);
            
            let results: Intersection[] = [];
            for (let i = 0; i < diffs.length; i++) {
                const diff = diffs[i];
                if(diff > 0) {
                    if(i > 0 && address.road.strangeLanes > 0) {
                        results.push(intersections[i - 1]);
                    }
                    if(address.road.charmLanes > 0) {
                        results.push(intersections[i]);
                    }
                    return results;
                }
            }

            if(address.road.strangeLanes > 0) {
                return [intersections[intersections.length - 1]];
            }
            return []
        } else {

        }
    }

    private *getIntersectionsOnRoad(road: Road): IterableIterator<Intersection> {
        let firstInt: Intersection = this.intersections.find(x => 
            x.roads.map(y => y.id).indexOf(road.id) != -1);
        for(const int of this.getConnectedIntersections(firstInt)) {
            if(int.hasRoad(road)) {
                yield int;
            }
        }
    }

    private *getConnectedIntersections(intersection: Intersection): 
        IterableIterator<Intersection> 
    {
        let id: number = this.getIntersectionID(intersection);
        let row: number[] = this.connections[id];

        for (let i = 0; i < row.length; i++) {
            const conn = row[i];
            if(conn != fillValue) {
                yield this.intersections[i];
            }
        }
    }

    getIntersectionID(intersection: Intersection): number {
        for (let i = 0; i < this.intersections.length; i++) {
            const int = this.intersections[i];
            if(int.equals(intersection)) {
                return i;
            }
        }

        throw new Error("Intersection not in network");
    }
}