import Car from "../models/car";
import CarController from "./car_controller";
import Address from "./address";

export default class DrivingCar extends Car {
    private controller: CarController;

    constructor(car: Car, public address: Address) {
        super(car.size, car.accel, car.turnSpeed);
    }

    drive() {
        
    }
}