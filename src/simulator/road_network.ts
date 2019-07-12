import RoadMap from "../models/road_map";
import Intersection from "./intersection";
import Road from "../models/road";
import Coord from "../models/coord";
import { intersectionGrouping, segmentsIntersect } from "../util";
import ICoord from "../interfaces/ICoord";

const fillValue: number = -1;

export default class RoadNetwork {
    public intersections: Intersection[];
    private connections: Intersection[][];

    constructor(public map: RoadMap) {
        this.initialize();
    }

    initialize() {
        this.createIntersections();
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
        for (const seg of intersectionGrouping(road.path, 2)) {
            for (const other of intersectionGrouping(otherRoad.path, 2)) {
                let coord: ICoord = segmentsIntersect(seg as [Coord, Coord],
                    other as [Coord, Coord]) 
                if(coord != undefined) {
                    return new Coord(coord.x, coord.y);
                }
            }
        }

        return undefined;
    }
}