import RoadMap from "../models/road_map";
import Road from "../models/road";
import Coord from "../models/coord";
import RoadNetwork from "../simulator/road_network";
import { getRoadDistance, getConnectingRoad, getAddress, getCoord, getDrivingDirection, getDistBetweenAddresses, getDistToIntersection } from "../simulator/simulator_helpers";
import Intersection from "../simulator/intersection";
import WorldBuilder from "../simulator/world_builder";
import Car from "../models/car";
import World from "../simulator/world";
import DrivingCar from "../simulator/driving_car";
import Address from "../simulator/address";
import PathFinder from "../simulator/path_finder";
import PathInstruction from "../simulator/path_instruction";
import { RoadDirection, DrivingDirection, IntersectionDirection } from "../enums";
import { TICK_DURATION, INTERSECTION_SIZE } from "../constants";
import { Speed, Random } from "../primitives";
import CarController from "../simulator/car_controller";
import LightSwitcher from "../simulator/light_switcher";
import TrafficLight from "../simulator/traffic_light";

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
        new Car(0, .01, 1, 1),
        new Car(1, .01, 1, 1),
        new Car(2, .01, 1, 1),
        new Car(3, .01, 1, 1)
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

test('intersections are same', () => {
    let int1: Intersection = network.intersections[12];
    let int2: Intersection = new Intersection(0, [map.roads[2], map.roads[7]], 
        new Coord(.2, .2));
    
    expect(int1.equals(int2)).toBeTruthy();
});

test('intersections same place different road order', () => {
    let int1: Intersection = network.intersections[12];
    let int2: Intersection = new Intersection(0, [map.roads[7], map.roads[2]], 
        new Coord(.2, .2));
    
    expect(int1.equals(int2)).toBeFalsy();
});

test('get intersections from road midpoint', () => {
    let location: Coord = new Coord(.25, .2);

    let intersections: Intersection[] = network.getNearestIntersections(location);

    let expected: Intersection[] = [network.intersections[12], network.intersections[13]];
    expect(intersections).toEqual(expected);
});

test('get intersection at beginning', () => {
    let simpleMap: RoadMap = new RoadMap([
        new Road(0, [new Coord(0, 1), new Coord(2, 1)], 1, 1),
        new Road(1, [new Coord(.5, 0), new Coord(.5, 2)], 1, 1),
        new Road(2, [new Coord(1.5, 0), new Coord(1.5, 2)], 1, 1)
    ]);
    let simpleNetwork: RoadNetwork = new RoadNetwork(simpleMap);
    let location: Coord = new Coord(.2, 1);
    let intersections: Intersection[] = simpleNetwork.getNearestIntersections(location);

    expect(intersections.length).toBe(1);
    expect(intersections[0].location.toTuple()).toEqual([.5, 1]);
});

test('get intersection at end', () => {
    let simpleMap: RoadMap = new RoadMap([
        new Road(0, [new Coord(0, 1), new Coord(2, 1)], 1, 1),
        new Road(1, [new Coord(.5, 0), new Coord(.5, 2)], 1, 1),
        new Road(2, [new Coord(1.5, 0), new Coord(1.5, 2)], 1, 1)
    ]);
    let simpleNetwork: RoadNetwork = new RoadNetwork(simpleMap);
    let location: Coord = new Coord(1.7, 1);
    let intersections: Intersection[] = simpleNetwork.getNearestIntersections(location);

    expect(intersections.length).toBe(1);
    expect(intersections[0].location.toTuple()).toEqual([1.5, 1]);
});

test('get no intersections on one-way', () => {
    let simpleMap: RoadMap = new RoadMap([
        new Road(0, [new Coord(0, 1), new Coord(2, 1)], 1, 0),
        new Road(1, [new Coord(.5, 0), new Coord(.5, 2)], 1, 1),
        new Road(2, [new Coord(1.5, 0), new Coord(1.5, 2)], 1, 1)
    ]);
    let location: Coord = new Coord(1.7, 1);
    let simpleNetwork: RoadNetwork = new RoadNetwork(simpleMap);
    let intersections: Intersection[] = simpleNetwork.getNearestIntersections(location);

    expect(intersections.length).toBe(0);
});

test('get intersections from intersection', () => {
    let int: Intersection = network.intersections[6];
    let neighbors: Intersection[] = network.getNearestIntersections(int);

    let resultIds = neighbors.map(x => x.id).sort((a, b) => a - b);
    let expectedIds = [1, 5, 7, 11];
    
    expect(resultIds).toEqual(expectedIds);
});

test('find simple path', () => {
    let location: Coord = new Coord(.3, .44);
    let dest: Coord = new Coord(.1, .03);

    let pathFinder: PathFinder = new PathFinder(network);
    let path: PathInstruction[] = pathFinder.getPath(location, dest);

    let expectedPath: PathInstruction[] = [
        new PathInstruction(map.roads[8], RoadDirection.Strange, .04, new Coord(.3, .4)),
        new PathInstruction(map.roads[4], RoadDirection.Strange, .1, new Coord(.1, .4)),
        new PathInstruction(map.roads[6], RoadDirection.Strange, .37, dest),
    ]

    expect(path.length).toBe(3);
    for (let i = 0; i < path.length; i++) {
        const instruction = path[i];
        const expected = expectedPath[i];
        expect(instruction.road.id).toBe(expected.road.id);
        expect(instruction.direction).toBe(expected.direction);
    }
});

test('find straight path', () => {
    let location: Coord = new Coord(.3, .44);
    let dest: Coord = new Coord(.3, .03);

    let pathFinder: PathFinder = new PathFinder(network);
    let path: PathInstruction[] = pathFinder.getPath(location, dest);

    expect(path.length).toBe(1);
    expect(path[0].road.id).toBe(8);
});

test('get coord from address', () => {
    let road: Road = new Road(0, 
        [new Coord(0, 1), new Coord(1, 1), new Coord(2, 2)], 1, 1);
    let address: Address = new Address(road, 2);
    let coord: Coord = getCoord(address);

    expect(coord.x).toBeCloseTo(1.707);
    expect(coord.y).toBeCloseTo(1.707);
});

test('right turn going up', () => {
    let path: PathInstruction[] = [
        new PathInstruction(map.roads[7], RoadDirection.Charm, .15, 
            new Coord(.2, .3)),
        new PathInstruction(map.roads[3], RoadDirection.Charm, .1, 
            new Coord(.3, .3))
    ];

    let result: DrivingDirection = getDrivingDirection(path[1], path[0]);

    expect(result).toBe(DrivingDirection.Right);
});

test('left turn going left', () => {
    let path: PathInstruction[] = [
        new PathInstruction(map.roads[2], RoadDirection.Strange, .15, 
            new Coord(.2, .2)),
        new PathInstruction(map.roads[7], RoadDirection.Strange, .1, 
            new Coord(.2, .1))
    ];

    let result: DrivingDirection = getDrivingDirection(path[1], path[0]);

    expect(result).toBe(DrivingDirection.Left);
});

test('get straight direction', () => {
    let path: PathInstruction[] = [
        new PathInstruction(map.roads[2], RoadDirection.Strange, .15, 
            new Coord(.2, .2)),
        new PathInstruction(map.roads[2], RoadDirection.Strange, .1, 
            new Coord(.1, .2))
    ];

    let result: DrivingDirection = getDrivingDirection(path[1], path[0]);

    expect(result).toBe(DrivingDirection.Straight);
});

test('drive along simple road', () => {
    let car: Car = new Car(0, .003, 10, 5);
    let road: Road = new Road(0, [new Coord(0, 1), new Coord(1, 1), new Coord(2, 2)],
        1, 1);

    let drivingCar: DrivingCar = new DrivingCar(car, new Address(road, 0),
        RoadDirection.Charm);
    drivingCar.setSpeedLimit(new Speed(40));
    
    let timeToEnd = 219.28 // seconds to get to end of road;
    for (let _ = 0; _ < Math.floor(timeToEnd / TICK_DURATION); _++) {
        drivingCar.drive();
    }

    expect(drivingCar.address.distance).toBeCloseTo(2.414, 3);
    let endLoc: Coord = getCoord(drivingCar.address);
    expect(endLoc.x).toBeCloseTo(2);
    expect(endLoc.y).toBeCloseTo(2);
});

test('drive along simple road strange direction', () => {
    let car: Car = new Car(0, .003, 10, 5);
    let road: Road = new Road(0, [new Coord(0, 1), new Coord(1, 1), new Coord(2, 2)],
        1, 1);

    let drivingCar: DrivingCar = new DrivingCar(car, new Address(road, 2.414),
        RoadDirection.Strange);
    drivingCar.setSpeedLimit(new Speed(40));
    
    let timeToEnd = 219.28 // seconds to get to end of road;
    for (let _ = 0; _ < Math.floor(timeToEnd / TICK_DURATION); _++) {
        drivingCar.drive();
    }

    expect(drivingCar.address.distance).toBeCloseTo(0, 3);
    let endLoc: Coord = getCoord(drivingCar.address);
    expect(endLoc.x).toBeCloseTo(0);
    expect(endLoc.y).toBeCloseTo(1);
});

test('drive follow simple path with turn', () => {
    let car: Car = new Car(0, .003, 10, 5);
    let addr: Address = new Address(map.roads[7], .09);
    let drivingCar: DrivingCar = new DrivingCar(car, addr, RoadDirection.Charm);
    let world: World = new World(network);
    world.setCars([drivingCar]);
    let controller: CarController = new CarController(drivingCar, world);
    
    drivingCar.setController(controller);

    let dest: Address = new Address(map.roads[2], .11);
    drivingCar.setDestination(dest);
    let timeToEnd: number = 20.025;
    for (let _ = 0; _ < Math.ceil(timeToEnd / TICK_DURATION); _++) {
        drivingCar.drive();
    }

    expect(drivingCar.address.road.id).toBe(dest.road.id);
    expect(drivingCar.address.distance).toBeCloseTo(dest.distance);
});

test('drive path with multiple turns', () => {
    let car: Car = new Car(0, .003, 10, 5);
    let addr: Address = new Address(map.roads[7], .09);
    let drivingCar: DrivingCar = new DrivingCar(car, addr, RoadDirection.Charm);
    let world: World = new World(network);
    world.setCars([drivingCar]);
    let controller: CarController = new CarController(drivingCar, world);
    
    drivingCar.setController(controller);

    let dest: Address = new Address(map.roads[6], .32);
    drivingCar.setDestination(dest);
    let timeToEnd: number = 50;
    for (let _ = 0; _ < Math.ceil(timeToEnd / TICK_DURATION); _++) {
        drivingCar.drive();
    }

    expect(drivingCar.address.road.id).toBe(dest.road.id);
    expect(drivingCar.address.distance).toBeCloseTo(dest.distance);
});

test('is in intersection', () => {
    let inCoord: Coord = new Coord(.1, .1001);
    let outCoord: Coord = new Coord(.2, .22);
    let inAddr: Address = getAddress(network, inCoord);
    let outAddr: Address = getAddress(network, outCoord);

    expect(network.getIntersectionFromAddr(inAddr)).toBeTruthy();
    expect(network.getIntersectionFromAddr(outAddr)).toBeFalsy();
});

test('build single car world', () => {
    let cars: Car[] = Array.from(defaultCars(1));

    let builder: WorldBuilder = new WorldBuilder(map, cars)

    // ensure that the car will try to be placed in an intersection
    makeRandomReturn([0.1, 0.1, 0.1, 0.1, 0.13]);

    let world = builder.build();
    expect(world.cars[0].address.distance).toBeCloseTo(0.26);
    expect(world.cars[0].address.road.id).toBe(1);
});

test('follow slower car', () => {
    let cars: Car[] = Array.from(defaultCars(2));
    let addrs: Address[] = [new Address(map.roads[2], .6), 
        new Address(map.roads[2], .3)];

    let dest: Address = new Address(map.roads[2], 1.99);

    let world: World = new World(network);
    let dcs: DrivingCar[] = [...Array(2).keys()].map(i => {
        let car: DrivingCar = new DrivingCar(cars[i], addrs[i], RoadDirection.Charm);
        car.setController(new CarController(car, world));
        car.setSpeedLimit(new Speed(20 * (i + 1)));
        return car;
    });
    world.setCars(dcs);
    dcs.forEach(car => {
        car.setDestination(dest);        
    });

    runSimulation(world, 1);

    expect(dcs[0].velocity.speedInMph).toBe(20);
    expect(dcs[1].velocity.speedInMph).toBe(40);

    runSimulation(world, 70);

    expect(dcs[0].velocity.speedInMph).toBe(20);
    expect(dcs[1].velocity.speedInMph).toBeCloseTo(20, 1);
});

test('get dist between addresses', () => {
    let a1: Address = new Address(map.roads[1], .9);
    let a2: Address = new Address(map.roads[1], 1.4);

    let dist: number = getDistBetweenAddresses(a1, a2, RoadDirection.Charm);
    expect(dist).toBeCloseTo(.5);
    dist = getDistBetweenAddresses(a2, a1, RoadDirection.Charm);
    expect(dist).toBeCloseTo(-.5);
    dist = getDistBetweenAddresses(a1, a2, RoadDirection.Strange);
    expect(dist).toBeCloseTo(-.5);
});

test('get cars on road', () => {
    let cars: Car[] = Array.from(defaultCars(3));
    let addrs: Address[] = [new Address(map.roads[2], .3), 
        new Address(map.roads[2], .6), new Address(map.roads[1], .2)];

    let world: World = new World(network);
    let dcs: DrivingCar[] = [...Array(2).keys()].map(i => {
        let car: DrivingCar = new DrivingCar(cars[i], addrs[i], RoadDirection.Charm);
        return car;
    });
    world.setCars(dcs);

    let carsOnRoad: DrivingCar[] = world.getCarsOnRoad(map.roads[2]);
    expect(carsOnRoad).toContain(world.cars[0]);
    expect(carsOnRoad).toContain(world.cars[1]);
    expect(carsOnRoad.length).toBe(2);
});

test('get distance to intersection', () => {
    let addr: Address = new Address(map.roads[2], .05);
    let int: Intersection = network.intersections[11];

    let dist: number = getDistToIntersection(addr, int);

    expect(dist).toBeCloseTo(.05 - INTERSECTION_SIZE, 3);
});

test('car stops at stop light', () => {
    let int: Intersection = network.intersections[7];
    let switcher: LightSwitcher = new SimpleLightSwitcher(int.light,
        IntersectionDirection.First);

    int.light.setSwitcher(switcher);

    let car: DrivingCar = new DrivingCar(defaultCars(1).next().value, 
        new Address(map.roads[6], .08), RoadDirection.Charm);
    
    let world: World = new World(network);
    let controller: CarController = new CarController(car, world);
    car.setController(controller);
    world.setCars([car]);
    
    car.setDestination(new Address(map.roads[6], 1));

    runSimulation(world, 30);

    expect(car.address.distance).toBeCloseTo(.1 - INTERSECTION_SIZE);
    expect(car.address.road.id).toBe(6);
});

test('multiple cars stop at stop light', () => {
    let int: Intersection = network.intersections[7];
    let switcher: LightSwitcher = new SimpleLightSwitcher(int.light,
        IntersectionDirection.First);

    int.light.setSwitcher(switcher);

    let baseCars: Car[] = Array.from(defaultCars(2));
    let addresses = [new Address(map.roads[6], .08),
        new Address(map.roads[6], .06)]
    let cars: DrivingCar[] = baseCars.map((c, i) => new DrivingCar(c, addresses[i],
        RoadDirection.Charm));
    let world: World = new World(network);
    world.setCars(cars);
    
    cars.forEach(car => {
        car.setController(new CarController(car, world));
        car.setDestination(new Address(map.roads[6], 1));
    });

    runSimulation(world, 30);

    expect(cars[0].address.distance).toBeCloseTo(.1 - INTERSECTION_SIZE);
    expect(cars[0].address.road.id).toBe(6);
    expect(cars[1].address.distance).toBeCloseTo(.1 - INTERSECTION_SIZE - cars[0].size);
    expect(cars[1].address.road.id).toBe(6);
});

test('get stopped at intersection', () => {
    expect(true).toBeFalsy();
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

function makeRandomReturn(lst: number[]): void {
    let buffer: IterableIterator<number> = circleYield(lst);
    Random.next = () => buffer.next().value;
}

function* circleYield(lst: number[]): IterableIterator<number> {
    for (let i = 0; i < lst.length; i++) {
        yield lst[i];
        if(i == lst.length - 1) {
            i = -1
        }
    }
}

function runSimulation(world: World, time: number): void {
    for (let _ = 0; _ < time / TICK_DURATION; _++) {
        world.tick();
    }
}

function* defaultCars(num: number): IterableIterator<Car> {
    for(let i = 0; i < num; i++) {
        yield new Car(i, .005, 100, 3);
    }
}

class SimpleLightSwitcher implements LightSwitcher {
    constructor(private light: TrafficLight, private direction: IntersectionDirection) {
        this.light.setSwitcher(this);
        light.greenDirection = this.direction;
    }

    tick(): void {}
    setDirection(dir: IntersectionDirection): void {}
    carSensorTripped(dir: IntersectionDirection): void {}
}

class AutoSwitcher implements LightSwitcher {
    constructor(private light: TrafficLight) {
    }

    tick(): void {}
    setDirection(dir: IntersectionDirection): void {}
    carSensorTripped(dir: IntersectionDirection): void {
        this.light.greenDirection = dir;
    }
}
