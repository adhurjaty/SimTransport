import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import RoadMap from "../models/road_map";
import TrafficLight from "./traffic_light";

export default class World {
    public map: RoadMap
    public lights: TrafficLight[];

    constructor(public network: RoadNetwork, public cars: DrivingCar[]) {
        this.map = network.map;
        this.lights = network.intersections.map(x => x.light);
    }

    tick() {
        this.cars.forEach(car => {
            car.drive();
        });
        this.lights.forEach(light => {
            light.tick();
        });
    }
}