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

export default class WorldBuilder {

    constructor(private map: RoadMap, private cars: Car[]) {

    }

    build(): World {
        let network = new RoadNetwork(this.map);
        let worldCars: DrivingCar[] = this.cars.map((c) => {
            let [addr, dir] = this.generateRandomAddressDir(network);
            return new DrivingCar(c, addr, dir);
        });
        return new World(network, worldCars);
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
        } while(network.isInIntersection(addr));

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