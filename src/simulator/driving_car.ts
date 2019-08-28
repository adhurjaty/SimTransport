import Car from "../models/car";
import CarController from "./car_controller";
import Address from "./address";
import { Coord, topCenterRect } from "../util";
import { RoadDirection } from "../enums";
import { getCoord, getCarTheta } from "./simulator_helpers";
import { TICK_DURATION, LANE_WIDTH, CAR_WIDTH } from "../constants";
import { Speed } from "../primitives";
import Intersection from "./intersection";

export default class DrivingCar extends Car {
    private controller: CarController;
    private turnTimeElapsed: number = 0;
    private onAtDest: () => void; 

    public speed: Speed = new Speed(0);
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
        // this.adjustSpeed();
        this.address.distance += this.movementAmount();
    }

    private movementAmount(): number {
        return this.speed.mps() * TICK_DURATION * this.getDirParity();
    }

    private getDirParity(): number {
        let parity = [1, -1];
        return parity[this.direction];
    }

    // forget about acceleration for now
    // private adjustSpeed(): void {
    //     // deceleration is instant, accel happens linearly
    //     this.speed.speedInMph += Math.min(this.speedLimit.speedInMph - this.speed.speedInMph, 
    //         this.accel * TICK_DURATION);
    // }

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

    setSpeed(speed: Speed): void {
        this.speed = speed;
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

    getCarRectCoords(): Coord[] {
        let angle: number = getCarTheta(this);
        let perp: number = angle + -Math.PI / 2;
        let centerCoord: Coord = getCoord(this.address);
        let offsetVec: Coord = Coord.fromPolar(LANE_WIDTH / 2, perp);
        let newCenter: Coord = centerCoord.add(offsetVec);
        return topCenterRect(newCenter, CAR_WIDTH, this.size, angle);
    }

    atDest(): void {
        if(this.onAtDest) {
            this.onAtDest();
        }
    }

    setOnAtDest(fn: ()=>void): void {
        this.onAtDest = fn;
    }
}