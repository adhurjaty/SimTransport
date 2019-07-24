import DrivingCar from "./driving_car";
import World from "./world";
import Address from "./address";
import PathInstruction from "./path_instruction";
import PathFinder from "./path_finder";
import { getCoord, getAddress, getRoadDistance } from "./simulator_helpers";
import { Speed } from "../primitives";
import { TICK_DURATION, INTERSECTION_SIZE } from "../constants";
import { RoadDirection } from "../enums";
import Coord from "../models/coord";
import Road from "../models/road";

export default class CarController {
    public path: PathInstruction[];

    constructor(private car: DrivingCar, private world: World) {

    }

    setDestination(addr: Address): void {
        let finder: PathFinder = new PathFinder(this.world.network);
        this.path = finder.getPath(this.car.getLocation(), getCoord(addr));

        this.car.direction = this.path[0].direction;
        this.car.setSpeed(this.getSpeedLimit());
    }

    private getSpeedLimit(): Speed {
        return new Speed(40);
    }

    makeDecision(): void {
        if(this.atDestination() || this.atRedLight()) {
            this.path = [];
            this.car.setSpeed(new Speed(0));
            return;
        }
        
        let distToWaypoint: number = this.distToWaypoint();
        if(distToWaypoint <= Number.EPSILON) {
            this.setNextWaypoint();
            return;
        }

        this.setForwardSpeed(distToWaypoint);
    }

    private distToWaypoint(): number {
        let destAddr: Address = getAddress(this.world.network, this.path[0].location);

        return Math.abs(this.car.address.distance - destAddr.distance) 
            - Number(this.path.length > 1) * INTERSECTION_SIZE;
    }

    private atDestination(): boolean {
        return this.path.length == 0 || (this.path.length == 1 
            && this.path[0].location.equals(this.car.getLocation()));
    }

    private atRedLight(): boolean {
        return false;
    }

    private setNextWaypoint(): void {
        let lastInstruction: PathInstruction = this.path.splice(0, 1)[0];

        this.car.address = this.getNextAddress(this.path[0].road, 
            lastInstruction.location);
        this.car.direction = this.path[0].direction;
        this.car.setSpeed(this.getSpeedLimit());
    }

    private getNextAddress(road: Road, intersectionLoc: Coord): Address {
        let addr: Address = new Address(road, getRoadDistance(road, road.path[0], 
            intersectionLoc));

        addr.distance += (this.path[0].direction == RoadDirection.Charm
            ? 1 : -1) * INTERSECTION_SIZE;

        return addr;
    }

    private setForwardSpeed(distToWaypoint: number) {
        let speed: Speed = this.getSpeedLimit();

        // if car is so close to checkpoint that it will overshoot next time step
        let distToStop: number = Math.min(distToWaypoint, this.getRedLightDist());
        if(distToStop < this.distPerTimeStep()) {
            speed = Speed.fromMps(distToStop / TICK_DURATION);
        }

        let car: DrivingCar = this.getCarAhead();
        if(car) {
            speed = new Speed(Math.min(speed.speedInMph, 
                this.getSpeedFromCarAhead(car)));
        }

        this.car.setSpeed(speed);
    }

    private distPerTimeStep(): number {
        return Math.abs(this.car.velocity.mps()) / TICK_DURATION;
    }

    private getRedLightDist(): number {
        return Number.MAX_SAFE_INTEGER;
    }

    private getCarAhead(): DrivingCar {
        return undefined;
    }

    private getSpeedFromCarAhead(car: DrivingCar) {
        return this.getSpeedLimit().speedInMph;
    }
}