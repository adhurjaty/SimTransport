import RoadMap from "../models/road_map";
import Road from "../models/road";
import Coord from "../models/coord";
import RoadNetwork from "../simulator/road_network";
import { getRoadDistance, getConnectingRoad, getAddress, findPath } from "../simulator/simulator_helpers";
import Intersection from "../simulator/intersection";
import WorldBuilder from "../simulator/world_builder";
import Car from "../models/car";
import World from "../simulator/world";
import DrivingCar from "../simulator/driving_car";
import Address from "../simulator/address";
import NavPath from "../simulator/nav_path";

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

test('get intersection at corner', () => {
    let cornerMap: RoadMap = new RoadMap([
        new Road(0, [new Coord(0, 1), new Coord(1, 1), new Coord(2, 2)], 1, 1),
        new Road(0, [new Coord(1, 0), new Coord(1, 2)], 1, 1)
    ]);
    let simpleNetwork: RoadNetwork = new RoadNetwork(cornerMap);

    expect(simpleNetwork.intersections.length).toBe(1);
    expect(simpleNetwork.intersections[0].location.toTuple()).toEqual([1, 1]);
});

test('find simple road distance', () => {
    let road: Road = map.roads[2];
    let fromCoord: Coord = new Coord(.02, .2);
    let toCoord: Coord = new Coord(1.5, .2);

    let result: number = getRoadDistance(road, fromCoord, toCoord);
    expect(result).toBe(1.48);
});

test('find complex road distance', () => {
    let coords: Coord[] = [
        new Coord(0, 0),
        new Coord(2, 2),
        new Coord(3, 5),
        new Coord(3, 4)
    ];

    let road: Road = new Road(0, coords, 1, 1);
    let points: [Coord, Coord] = [new Coord(1, 1), new Coord(3, 4.5)];

    let expected: number = 5.076
    let distance: number = getRoadDistance(road, ...points)
    expect(distance).toBeCloseTo(expected, 3); 
});

test('get connecting road', () => {
    let firstInt: Intersection = network.getIntersection(1, 6);
    let secondInt: Intersection = network.getIntersection(1, 8);

    let road: Road = getConnectingRoad(firstInt, secondInt);
    expect(road.id).toBe(1);
});

test('get non-connecting intersection road', () => {
    let firstInt: Intersection = network.getIntersection(1, 6);
    let secondInt: Intersection = network.getIntersection(2, 8);

    let road: Road = getConnectingRoad(firstInt, secondInt);
    expect(road).toBeUndefined();
});

test('get connecting road against one-way', () => {
    let r1: Road = new Road(0, [new Coord(0, .2), new Coord(2, .2)], 1, 0);
    let r2: Road = new Road(1, [new Coord(.5, 0), new Coord(.5, 2)], 1, 1);
    let r3: Road = new Road(2, [new Coord(1.5, 0), new Coord(1.5, 2)], 1, 1);
    let m: RoadMap = new RoadMap([r1, r2, r3]);
    let net: RoadNetwork = new RoadNetwork(m);

    let fromInt: Intersection = net.getIntersection(0, 2);
    let toInt: Intersection = net.getIntersection(0, 1);

    let connRoad: Road = getConnectingRoad(fromInt, toInt);
    expect(connRoad).toBeUndefined();
});

test('get simple network', () => {
    let roads: Road[] = [
        new Road(0, [new Coord(0, .5), new Coord(2, .5)], 1, 0),
        new Road(1, [new Coord(.5, 0), new Coord(.5, 2)], 1, 1),
        new Road(2, [new Coord(1.5, 0), new Coord(1.5, 2)], 1, 1),
        new Road(3, [new Coord(0, 1.5), new Coord(2, 1.5)], 1, 1)
    ];
    let m: RoadMap = new RoadMap(roads);
    let net: RoadNetwork = new RoadNetwork(m);

    let expected: number[][] = [
        [0, 1, 1, -1],
        [-1, 0, -1, 1],
        [1, -1, 0, 1],
        [-1, 1, 1, 0]
    ];

    expect(net.connections).toEqual(expected);
});

test('get road from coord', () => {
    let coord: Coord = new Coord(.22, .1);

    let road: Road = network.getRoad(coord);

    expect(road.id).toBe(1);
})

test('build simple world', () => {
    let cars: Car[] = [
        new Car(.01, 1, 1),
        new Car(.01, 1, 1),
        new Car(.01, 1, 1),
        new Car(.01, 1, 1)
    ];

    let builder: WorldBuilder = new WorldBuilder(map, cars);
    let world: World = builder.build();

    expect(world.map.roads.length).toBe(10);
    expect(world.cars.length).toBe(4);
});

test('get address from coord', () => {
    let location: Coord = new Coord(0.3, .44);

    let address: Address = getAddress(network, location);

    let road: Road = map.roads[8];
    expect(address.road.id).toBe(road.id);
    expect(address.distance).toEqual(.44);
});

test('find simple path', () => {
    let location: Coord = new Coord(0.3, .44);
    let dest: Coord = new Coord(.1, .03);

    let path: NavPath = findPath(network, location, dest);

    let startAddr: Address = getAddress(network, location);
    let endAddr: Address = getAddress(network, dest);
    let intCoords: [number, number][] = [[.1, .4], [.3, .4]];

    expect(path.startAddress.road.id).toBe(startAddr.road.id);
    expect(path.startAddress.distance).toBeCloseTo(startAddr.distance);
    expect(path.endAddress.road.id).toBe(endAddr.road.id);
    expect(path.endAddress.distance).toBeCloseTo(endAddr.distance);
    expect(path.intersections.map(x => x.location.toTuple())).toEqual(intCoords);
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