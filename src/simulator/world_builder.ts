import RoadMap from "../models/road_map";
import Car from "../models/car";
import World from "./world";
import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";

export default class WorldBuilder {

    constructor(private map: RoadMap, private cars: Car[]) {

    }

    build(): World {
        let network = new RoadNetwork(this.map);
        let worldCars: DrivingCar[] = this.cars.map((c) => new DrivingCar(c));
        return new World(network, worldCars);
    }
}