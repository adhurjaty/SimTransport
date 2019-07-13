import Car from "../models/car";

export default class DrivingCar extends Car {
    constructor(car: Car) {
        super(car.size, car.accel, car.turnSpeed);
    }

    drive() {
        
    }
}