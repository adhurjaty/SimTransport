import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import RoadMap from "../models/road_map";
import TrafficLight from "./traffic_light";
import Road from "../models/road";
import Intersection from "./intersection";
import Address from "./address";
import { followRoad, getAddress, getAddressOnRoad } from "./simulator_helpers";
import { otherDirection } from "../enums";

export default class World {
    public map: RoadMap
    public lights: TrafficLight[];
    public cars: DrivingCar[];

    constructor(public network: RoadNetwork) {
        this.map = network.map;
        this.lights = network.intersections.map(x => x.light);
    }

    setCars(cars: DrivingCar[]): void {
        this.cars = cars;
    }

    tick() {
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

    private tripLightSensors(): void {

    }

    private getCarsAtIntersections(): CarsAtIntersection[] {
        let stoppedCars: DrivingCar[] = this.cars.filter(car => 
            car.velocity.speedInMph < Number.EPSILON);
        let carsAtInts: CarsAtIntersection[] = [];
        for (const car of stoppedCars) {
            let int: Intersection = car.atIntersection();
            if(int) {
                let cai: CarsAtIntersection = new CarsAtIntersection(int,
                    this.getCarsAtIntersection(int, car, stoppedCars));
                carsAtInts.push(cai);
            }
        }

        return carsAtInts;
    }

    private getCarsAtIntersection(intersection: Intersection, firstCar: DrivingCar,
        stoppedCars: DrivingCar[]): DrivingCar[] 
    {
        let addr: Address = getAddressOnRoad(firstCar.address.road,
            intersection.location);
        return Array.from(this.getCarsHelper(addr, firstCar, stoppedCars));
    }

    private *getCarsHelper(location: Address, car: DrivingCar,
        stoppedCars: DrivingCar[]): IterableIterator<DrivingCar>
    {
        while(car != undefined) {
            yield car;
            location = followRoad(location, car.size, otherDirection(car.direction))
            car = this.getCarAtLocation(location, stoppedCars);
        }
    }

    private getCarAtLocation(location: Address, cars: DrivingCar[]): DrivingCar {
        return cars.find(c => c.address.equals(location));
    }
}

class CarsAtIntersection {
    constructor(public intersection: Intersection, public cars: DrivingCar[]) {}
}