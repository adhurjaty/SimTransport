import World from "../simulator/world";
import Intersection from "../simulator/intersection";
import { IntersectionDirection, RoadDirection } from "../enums";
import Address from "../simulator/address";
import DrivingCar from "../simulator/driving_car";
import CarController from "../simulator/car_controller";
import RoadMap from "../models/road_map";
import RoadNetwork from "../simulator/road_network";
import { createMap, TrippedTestSwitcher, defaultCars } from "./test_exports";

export default function makeTestWorld(): World {
    let map: RoadMap = createMap();
    let network: RoadNetwork = new RoadNetwork(map);
    
    let addresses: Address[] = [
        new Address(map.roads[1], .25),
        new Address(map.roads[1], .35)
    ];
    let dests: Address[] = [
        new Address(map.roads[8], .15),
        new Address(map.roads[8], .05),
    ];
    let cars: DrivingCar[] = Array.from(defaultCars(2)).map((c, i) => 
        new DrivingCar(c, addresses[i], <RoadDirection>i));

    let world: World = new World(network);
    world.setCars(cars);

    cars.forEach((c, i) => {
        c.setController(new CarController(c, world));
        c.setDestination(dests[i]);
    });
    
    return world;
}