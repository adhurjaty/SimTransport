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

    let int: Intersection = network.intersections[6];
    let switcher: TrippedTestSwitcher = new TrippedTestSwitcher(int.light,
        IntersectionDirection.First);

    int.light.setSwitcher(switcher);
    let addresses: Address[] = [
        new Address(map.roads[6], .08),
        new Address(map.roads[1], .08),
        new Address(map.roads[6], .12),
        new Address(map.roads[6], .14),
    ];

    let cars: DrivingCar[] = Array.from(defaultCars(4)).map((c, i) => {
        let dir: RoadDirection = <RoadDirection>(i / 2);
        let dc = new DrivingCar(c, addresses[i], dir);
        return dc;
    });

    let world: World = new World(network)
    world.setCars(cars);

    cars.forEach(c => {
        c.setController(new CarController(c, world));
        c.setDestination(new Address(map.roads[1], 1));
    });

    return world;
}