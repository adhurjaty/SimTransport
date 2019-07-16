import Car from "../models/car";
import CarController from "./car_controller";
import Address from "./address";
import Coord from "../models/coord";

export default class DrivingCar extends Car {
    private controller: CarController;
    public speed: number = 0;

    constructor(car: Car, public address: Address) {
        super(car.size, car.accel, car.turnSpeed);
    }

    drive() {
        
    }

    setDestination(addr: Address) {
        this.controller.setDestination(addr);
    }

    getLocation(): Coord {
        return 
    }
}