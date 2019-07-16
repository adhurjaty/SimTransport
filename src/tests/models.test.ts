import Road from "../models/road";
import Coord from "../models/coord";
import RoadMap from "../models/road_map";
import Car from "../models/car";
import { LineSegment } from "../interfaces/LineSegment";

test('simple coord test', () => {
    let coord: Coord = new Coord(4, 7);
    expect(coord.x).toBe(4);
    expect(coord.y).toBe(7);
});

test('simple road test', () => {
    let coords: Coord[] = [new Coord(0, 0), new Coord(4, 0)];
    let road: Road = new Road(0, coords, 1, 1);
    expect(road.charmLanes).toBe(1);
    expect(road.path[1].x).toBe(4);
});

test('simple map test', () => {
    let roads: Road[] = Array.from(generate_roads(6));
    let map: RoadMap = new RoadMap(roads);

    expect(map.roads[3].path[1].x).toBe(10);
    expect(map.roads[2].path[0].y).toBe(2);
});

test('simple car test', () => {
    let car: Car = new Car(4, .01, 3);
    expect(car.accel).toBe(.01);
    expect(car.size).toBe(4);
});

test('road to line segments', () => {
    let road: Road = new Road(0, [
        new Coord(0, 0), new Coord(0, 1), new Coord(1, 1), new Coord(2, 1)
    ], 1, 1);

    let arr: LineSegment[] = Array.from(road.toLineSegments());
    expect(arr.length).toBe(3);
});

function* generate_roads(n: number): IterableIterator<Road> {
    let xSpacing = 10;
    let ySpacing = 1;
    for (let i = 0; i < n; i++) {
        let coords: Coord[] = [new Coord(0, i*ySpacing), 
            new Coord(xSpacing, i*ySpacing)];
        yield new Road(i, coords, 1, 1);
    }
}
