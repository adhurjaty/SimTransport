import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import RoadMap from "../models/road_map";
import TrafficLight from "./traffic_light";
import Road from "../models/road";
import Intersection from "./intersection";
import Address from "./address";
import { followRoad, getAddress, getAddressOnRoad } from "./simulator_helpers";
import { otherDirection } from "../enums";
import LightTripper from "./light_tripper";

export default class World {
    private lightTripper: LightTripper; 
    
    public map: RoadMap
    public lights: TrafficLight[];
    public cars: DrivingCar[];

    constructor(public network: RoadNetwork) {
        this.map = network.map;
        this.lights = network.intersections.map(x => x.light);
        this.lightTripper = new LightTripper(this);
    }

    setCars(cars: DrivingCar[]): void {
        this.cars = cars;
    }

    tick() {
        this.lightTripper.tripSensors();
        this.cars.forEach(car => {
            car.drive();
        });
        this.lights.forEach(light => {
            light.tick();
        });
    }

    getCarsOnRoad(road: Road): DrivingCar[] {
        return this.cars.filter(c => c.address.road.id == road.id);
    }

}