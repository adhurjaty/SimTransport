import RoadMap from "../models/road_map";
import Intersection from "./intersection";
import Road from "../models/road";
import Coord from "../models/coord";
import { tipTailGrouping, segmentsIntersect } from "../util";
import ICoord from "../interfaces/ICoord";
import { LineSegment } from "../interfaces/LineSegment";
import { getConnectingRoad, getRoadDistance } from "./simulator_helpers";

const fillValue: number = -1;

export default class RoadNetwork {
    public intersections: Intersection[];
    private connections: number[][];

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
        for (const seg of tipTailGrouping(road.path, 2)) {
            for (const other of tipTailGrouping(otherRoad.path, 2)) {
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
        this.connections = Array(this.intersections.length).fill(
            Array(this.intersections.length).fill(fillValue));

        for (let i = 0; i < this.intersections.length; i++) {
            for (let j = i; j < this.intersections.length; j++) {
                if(i == j) {
                    this.connections[i][j] = 0;
                    continue;
                }
                let fromInt: Intersection = this.intersections[i];
                let toInt: Intersection = this.intersections[j];
                
                let connectingRoad: Road = getConnectingRoad(fromInt, toInt);
                if(connectingRoad != undefined) {
                    this.connections[i][j] = getRoadDistance(connectingRoad, 
                        fromInt.location, toInt.location);
                }
            }
            
        }
    }
}