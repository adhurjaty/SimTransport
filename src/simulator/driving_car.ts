import Car from "../models/car";
import World from "./world";
import CarController from "./car_controller";

export default class DrivingCar extends Car {
    private controller: CarController;

    constructor(car: Car) {
        super(car.size, car.accel, car.turnSpeed);
    }

    drive() {
        
    }
}