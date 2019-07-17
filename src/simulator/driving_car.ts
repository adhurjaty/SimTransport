import Car from "../models/car";
import CarController from "./car_controller";
import Address from "./address";
import Coord from "../models/coord";
import { RoadDirection } from "../enums";
import { getCoord } from "./simulator_helpers";

export default class DrivingCar extends Car {
    private controller: CarController;
    private turnTimeElapsed: number;
    
    public velocity: number = 0;
    public turning: boolean = false;

    constructor(car: Car, public address: Address, public direction: RoadDirection) {
        super(car.size, car.accel, car.turnTime);
    }

    drive() {
        if(this.turning) {
            this.turn();
        } else {
            this.address.distance += this.movementAmount();
        }
    }

    private turn(): void {
        this.turnTimeElapsed++;
        if(this.turnTimeElapsed >= this.turnTime) {
            // update address with new road and init location
            // update direction
        }
    }

    setDestination(addr: Address) {
        this.controller.setDestination(addr);
    }

    getLocation(): Coord {
        return getCoord(this.address);
    }

    private movementAmount(): number {
        // TODO: account for time-step frequency
        return this.velocity;
    }
}