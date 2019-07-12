import RoadMap from "../models/road_map";
import Intersection from "./intersection";
import Road from "../models/road";
import Coord from "../models/coord";
import { intersectionGrouping, segmentsIntersect } from "../util";

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
                if(this.intersects(road, otherRoad)) {
                    this.intersections.push(new Intersection([road, otherRoad]));
                }
            }
        }
    }

    intersects(road: Road, otherRoad: Road): boolean {
        for (const seg of intersectionGrouping(road.path, 2)) {
            for (const other of intersectionGrouping(otherRoad.path, 2)) {
                if(segmentsIntersect(seg as [Coord, Coord], other as [Coord, Coord])) {
                    return true;
                }
            }
        }

        return false;
    }
}