import World from "./world";
import DrivingCar from "./driving_car";
import Intersection from "./intersection";
import Address from "./address";
import { getAddressOnRoad, followRoad } from "./simulator_helpers";
import { otherDirection } from "../enums";
import { PrunableQueue } from "../util";

export default class LightTripper {
    private carsAtIntersections: DrivingCar[] = [];

    constructor(private world: World) {

    }

    tripSensors(): void {
        let stoppedCars: DrivingCar[] = this.world.cars.filter(car => 
            car.velocity.speedInMph < 1e-2);
        let carsAtInts: DrivingCar[] = [];
        let carQueue: PrunableQueue<DrivingCar> = new PrunableQueue(stoppedCars);
        while(!carQueue.empty()) {
            const car = carQueue.pop();
            let int: Intersection = car.atIntersection();

            if(int) {
                let intCars: DrivingCar[] = 
                    this.getCarsAtIntersection(int, car, stoppedCars);
                carQueue.prune(intCars);
                carsAtInts = carsAtInts.concat(intCars);
                for (const intCar of intCars) {
                    if(this.carsAtIntersections.find(x => x.id == intCar.id) 
                        == undefined)
                    {
                        int.light.tripSensor(intCar.address.road);
                    }
                }
            }
        }

        this.carsAtIntersections = carsAtInts;
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


