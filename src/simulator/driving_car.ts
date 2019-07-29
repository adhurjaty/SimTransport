import Car from "../models/car";
import CarController from "./car_controller";
import Address from "./address";
import Coord from "../models/coord";
import { RoadDirection } from "../enums";
import { getCoord } from "./simulator_helpers";
import { TICK_DURATION } from "../constants";
import { Speed } from "../primitives";
import Intersection from "./intersection";

export default class DrivingCar extends Car {
    private controller: CarController;
    private turnTimeElapsed: number;
    
    public velocity: Speed = new Speed(0);
    public speedLimit: Speed = new Speed(40);
    public turning: boolean = false;

    constructor(car: Car, public address: Address, public direction: RoadDirection) {
        super(car.id, car.size, car.accel, car.turnTime);
    }

    setController(cont: CarController): void {
        this.controller = cont;
    }

    drive(): void {
        if(this.controller) {
            this.controller.makeDecision();
        }
        if(this.turning) {
            this.executeTurn();
        } else {
            this.moveForward();
        }
    }

    private moveForward(): void {
        this.adjustSpeed();
        this.address.distance += this.movementAmount();
    }

    private movementAmount(): number {
        return this.velocity.mps() * TICK_DURATION;
    }

    private adjustSpeed(): void {
        let speed: number = Math.abs(this.velocity.speedInMph);
        let parity: number = this.direction == RoadDirection.Charm ? 1 : -1;

        // deceleration is instant, accel happens linearly
        speed += Math.min(this.speedLimit.speedInMph - speed, this.accel * TICK_DURATION);
        this.velocity.speedInMph = speed * parity;
    }

    private executeTurn(): void {
        this.turnTimeElapsed++;
        if(this.turnTimeElapsed >= this.turnTime / TICK_DURATION) {
            this.turnTimeElapsed = 0;
            this.turning = false;
        }
    }

    setDestination(addr: Address): void {
        if(this.controller == undefined) {
            throw new Error("Must attach a car controller");
        }
        this.controller.setDestination(addr);
    }

    setSpeedLimit(limit: Speed): void {
        this.speedLimit = limit;
    }

    getLocation(): Coord {
        return getCoord(this.address);
    }

    atIntersection(): Intersection {
        return this.controller.atIntersection();
    }
}