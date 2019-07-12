import RoadMap from "../models/road_map";
import Road from "../models/road";
import Coord from "../models/coord";
import RoadNetwork from "../simulator/road_network";
import { getRoadDistance } from "../simulator/simulator_helpers";

const parallelRoadDistance: number = .1;
const roadLength: number = 2;
let roadID: number = 0;

let map: RoadMap = createMap();
let network: RoadNetwork = new RoadNetwork(map);

test('intersection network size', () => {
    expect(network.intersections.length).toBe(25);
});

test('get intersection locations', () => {
    expect(network.intersections.map(x => x.location)).toContainEqual({x: .2, y: .2});
    expect(network.intersections.map(x => x.location)).toContainEqual({x: .1, y: .4});
});

test('find simple road distance', () => {
    let road: Road = map.roads[2];
    let fromCoord: Coord = new Coord(.02, .2);
    let toCoord: Coord = new Coord(1.5, .2);

    let result: number = getRoadDistance(road, fromCoord, toCoord);
    expect(result).toBe(1.48);
});

function createMap(): RoadMap {
    let grid: Road[] = generateGrid(5);
    return new RoadMap(grid);
}

function generateGrid(numRoads: number): Road[] {
    return Array.from(createRoadRows(numRoads))
        .concat(Array.from(createRoadColumns(numRoads)));
}

function* createRoadRows(numRoads: number): IterableIterator<Road> {
    yield* createRoads(numRoads, makeHorizontalPath);
}

function* createRoadColumns(numRoads: number): IterableIterator<Road> {
    yield* createRoads(numRoads, makeVerticalPath);
}

function* createRoads(numRoads: number, coordCreator: (n: number) => Coord[]): 
    IterableIterator<Road> 
{
    for (let i = 0; i < numRoads; i++) {
        let path = coordCreator(i);
        yield new Road(roadID, path, 1, 1);
        roadID++;
    }
}

function makeHorizontalPath(roadNum: number): Coord[] {
    return [new Coord(0, roadNum * parallelRoadDistance), 
        new Coord(roadLength, roadNum * parallelRoadDistance)];
}

function makeVerticalPath(roadNum: number): Coord[] {
    return [new Coord(roadNum * parallelRoadDistance, 0), 
        new Coord(roadNum * parallelRoadDistance, roadLength)];
}