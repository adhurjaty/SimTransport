import RoadMap from "../models/road_map";
import Intersection from "./intersection";
import Road from "../models/road";
import Coord from "../models/coord";

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
        for (const road of this.map.roads) {
            for (const otherRoad of this.map.roads) {
                if(road.id == otherRoad.id) {
                    continue;
                }

                if(this.intersects(road, otherRoad)) {
                    this.intersections.push(new Intersection([road, otherRoad]));
                }
            }
        }
    }

    intersects(road: Road, otherRoad: Road): boolean {
        let ccw: (a: Coord, b: Coord, c: Coord) => boolean = (a, b, c) => {
            return (b.y - a.y) * (c.x - a.x) < (c.y - a.y) * (b.x - a.x);
        }

        let segmentIntersects: (seg: [Coord, Coord], other: [Coord, Coord]) => boolean
            = (seg, other) =>
        {
            return ccw(seg[0], other[0], other[1]) != ccw(seg[1], other[0], other[1])
                && ccw(seg[0], seg[1], other[0]) != ccw(seg[0], seg[1], other[1]);
        };

        return ccw(road.path[0], otherRoad.path)
    }
}