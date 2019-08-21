import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import RoadMap from "../models/road_map";
import TrafficLight from "./traffic_light";
import Road from "../models/road";
import Intersection from "./intersection";
import Address from "./address";
import { followRoad, getAddress, getAddressOnRoad, randomAddress } from "./simulator_helpers";
import { otherDirection } from "../enums";
import LightTripper from "./light_tripper";
import { Rectangle, flatten } from "../util";
import { Coord } from "../util";

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

    getBounds(): Rectangle {
        let coords: Coord[] = flatten(this.map.roads.map(r => r.path));
        let xs: number[] = coords.map(c => c.x).sort((a, b) => a - b);
        let ys: number[] = coords.map(c => c.y).sort((a, b) => a - b);

        let end: number = coords.length - 1;
        let width: number = xs[end] - xs[0];
        let height: number = ys[end] - ys[0];
        return new Rectangle(xs[0], ys[0], width, height);
    }

    setRandomDestinations(): void {
        for (const car of this.cars) {
            car.setDestination(randomAddress(this.network));
        }
    }
}