import World from "./world";
import DrivingCar from "./driving_car";
import Intersection from "./intersection";
import Address from "./address";
import { getAddressOnRoad, followRoad } from "./simulator_helpers";
import { otherDirection } from "../enums";
import { PrunableQueue, within } from "../util";

export default class LightTripper {
    private carsAtIntersections: DrivingCar[] = [];

    constructor(private world: World) {

    }

    tripSensors(): void {
        let stoppedCars: DrivingCar[] = this.world.cars.filter(car => 
            car.speed.speedInMph < .01);
        let carsAtInts: DrivingCar[] = [];
        let carQueue: PrunableQueue<DrivingCar> = new PrunableQueue(
            Object.assign([], stoppedCars));
        while(!carQueue.empty()) {
            const car = carQueue.pop();
            let int: Intersection = car.atIntersection();

            if(int) {
                let intCars: DrivingCar[] = 
                    this.getCarsAtIntersection(car, stoppedCars);
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

    private getCarsAtIntersection(firstCar: DrivingCar, stoppedCars: DrivingCar[]): 
        DrivingCar[] 
    {
        return Array.from(this.getCarsHelper(firstCar, stoppedCars));
    }

    private *getCarsHelper(car: DrivingCar, stoppedCars: DrivingCar[]): 
        IterableIterator<DrivingCar>
    {
        while(car != undefined) {
            yield car;
            let location: Address = followRoad(car.address, car.size,
                otherDirection(car.direction))
            car = this.getCarAtLocation(location, stoppedCars);
        }
    }

    private getCarAtLocation(location: Address, cars: DrivingCar[]): DrivingCar {
        return cars.find(c => c.address.road.id == location.road.id &&
            within(c.address.distance, location.distance, .0001));
    }
}


