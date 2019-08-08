import RoadMap from "../models/road_map";
import Car from "../models/car";
import World from "./world";
import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import Address from "./address";
import { RoadDirection } from "../enums";
import { randInt, randDouble } from "../util";
import Road from "../models/road";
import { getRoadLength } from "./simulator_helpers";
import CarController from "./car_controller";
import LightSwitcher from "./light_switcher";
import TrafficLight from "./traffic_light";
import DefaultLightSwitcher from "./default_light_switcher";
import Coord from "../models/coord";

const PARALLEL_ROAD_DISTANCE = .1;

export default class WorldBuilder {

    private roadID: number = 0;

    constructor(private map: (RoadMap | null), private cars: (Car[] | null)) {
        if(!this.map) {
            this.map = this.createSimpleMap(10);
        }
        if(!this.cars) {
            this.cars = this.createCars(20);
        }
    }

    createSimpleMap(roadsPerSide: number): RoadMap {
        this.roadID = 0;
        let grid: Road[] = Array.from(this.createRoadRows(roadsPerSide))
            .concat(Array.from(this.createRoadColumns(roadsPerSide)));
        return new RoadMap(grid);
    }


    private *createRoadRows(numRoads: number): IterableIterator<Road> {
        let roadLength = numRoads * PARALLEL_ROAD_DISTANCE;
        yield* this.createRoads(numRoads, 
            (num) => this.makeHorizontalPath(num, roadLength));
    }

    private *createRoadColumns(numRoads: number): IterableIterator<Road> {
        let roadLength = numRoads * PARALLEL_ROAD_DISTANCE;
        yield* this.createRoads(numRoads, 
            (num) => this.makeVerticalPath(num, roadLength));
    }

    private *createRoads(numRoads: number, coordCreator: (n: number) => Coord[]): 
        IterableIterator<Road> 
    {
        for (let i = 0; i < numRoads; i++) {
            let path = coordCreator(i);
            yield new Road(this.roadID, path, 1, 1);
            this.roadID++;
        }
    }

    private makeHorizontalPath(roadNum: number, roadLength: number): Coord[] {
        return [new Coord(0, roadNum * PARALLEL_ROAD_DISTANCE), 
            new Coord(roadLength, roadNum * PARALLEL_ROAD_DISTANCE)];
    }
    
    private makeVerticalPath(roadNum: number, roadLength: number): Coord[] {
        return [new Coord(roadNum * PARALLEL_ROAD_DISTANCE, 0), 
            new Coord(roadNum * PARALLEL_ROAD_DISTANCE, roadLength)];
    }

    createCars(numCars: number): Car[] {
        let cars: Car[] = [];
        for (let i = 0; i < numCars; i++) {
            cars.push(new Car(i, .005, 10, 3));
        }
        return cars;
    }

    build(): World {
        let network = new RoadNetwork(this.map);
        let world = new World(network);

        let worldCars: DrivingCar[] = this.cars.map((c) => {
            let [addr, dir] = this.generateRandomAddressDir(network);
            let car: DrivingCar = new DrivingCar(c, addr, dir);
            let controller: CarController = new CarController(car, world);
            car.setController(controller);
            return car;
        });
        world.setCars(worldCars);

        world.network.intersections.forEach(int => {
            let light: TrafficLight = int.light;
            let controller: LightSwitcher = new DefaultLightSwitcher(light);
            light.setSwitcher(controller);
        });

        return world
    }

    private generateRandomAddressDir(network: RoadNetwork): [Address, RoadDirection] {
        let addr: Address = this.randomAddress(network)
        return [addr, this.randomDirection(addr.road)]
    }

    private randomAddress(network: RoadNetwork): Address {
        let roadId: number = randInt(network.map.roads.length);
        let road: Road = network.map.roads[roadId];

        let maxDist: number = getRoadLength(road);
        let addr: Address;
        do {
            let distance = randDouble(maxDist);
            addr = new Address(road, distance);
        } while(network.getIntersectionFromAddr(addr) != undefined);

        return addr;
    }

    private randomDirection(road: Road): RoadDirection {
        if(road.charmLanes == 0) {
            return RoadDirection.Strange;
        }
        if(road.strangeLanes == 0) {
            return RoadDirection.Charm;
        }

        return randInt(road.charmLanes + road.strangeLanes) < road.charmLanes 
            ? RoadDirection.Charm : RoadDirection.Strange;
    }
}