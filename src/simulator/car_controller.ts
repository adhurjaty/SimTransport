import DrivingCar from "./driving_car";
import World from "./world";
import Address from "./address";
import PathInstruction from "./path_instruction";
import PathFinder from "./path_finder";
import { getCoord, getAddress, getRoadDistance, getDistBetweenAddresses, getDistToIntersection, getAddressOnRoad, followRoad } from "./simulator_helpers";
import { Speed } from "../primitives";
import { TICK_DURATION, INTERSECTION_SIZE } from "../constants";
import { RoadDirection, directionParity } from "../enums";
import Coord from "../models/coord";
import Road from "../models/road";
import Intersection from "./intersection";

export default class CarController {
    public path: PathInstruction[];

    constructor(private car: DrivingCar, private world: World) {

    }

    setDestination(addr: Address): void {
        let finder: PathFinder = new PathFinder(this.world.network);
        this.path = finder.getPath(this.car.getLocation(), getCoord(addr));

        this.car.direction = this.path[0].direction;
        this.makeDecision();
    }

    private getSpeedLimit(): Speed {
        return this.car.speedLimit;
    }

    makeDecision(): void {
        if(this.atDestination()) {
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

        return Math.abs(this.car.address.distance - destAddr.distance);
    }

    private atDestination(): boolean {
        return this.path.length == 0 || (this.path.length == 1 
            && this.path[0].location.equals(this.car.getLocation()));
    }

    private getRedLightDist(): number {
        let intersection: Intersection = this.getIntersectionAhead();
        if(intersection == undefined) {
            return Infinity;
        }

        let greenRoad: Road = intersection.roads[intersection.light.greenDirection];
        if(greenRoad.id == this.car.address.road.id) {
            return Infinity;
        }

        let dist: number = getDistToIntersection(this.car.address, intersection);
        return Math.max(dist - INTERSECTION_SIZE, 0);
    }

    private getIntersectionAhead(): Intersection {
        let ints: IterableIterator<Intersection> = this.world.network
            .getIntersectionsOnRoad(this.car.address.road);

        let intAhead: Intersection = undefined;        
        let minDist: number = Infinity;
        for (const int of ints) {
            let intAddr: Address = getAddressOnRoad(this.car.address.road, 
                int.location);
            let dist: number = getDistBetweenAddresses(this.car.address, intAddr,
                this.car.direction);

            if(dist > 0 && dist < minDist) {
                minDist = dist;
                intAhead = int;
            }
        }

        return intAhead;
    }

    private setNextWaypoint(): void {
        let lastInstruction: PathInstruction = this.path.splice(0, 1)[0];

        this.car.address = this.getNextAddress(this.path[0].road, 
            lastInstruction.location);
        this.car.direction = this.path[0].direction;
        this.makeDecision();
    }

    private getNextAddress(road: Road, intersectionLoc: Coord): Address {
        let addr: Address = new Address(road, getRoadDistance(road, road.path[0], 
            intersectionLoc));

        return addr;
    }

    private setForwardSpeed(distToWaypoint: number) {
        let speed: Speed = this.getSpeedLimit();

        // if car is so close to checkpoint that it will overshoot next time step
        let distToStop: number = Math.min(distToWaypoint, this.getRedLightDist());
        if(distToStop - Number.EPSILON <= this.distPerTimeStep()) {
            speed = Speed.fromMps(distToStop / TICK_DURATION);
        }

        let car: DrivingCar = this.getCarAhead();
        if(car) {
            // Zeno's paradox!
            speed = new Speed(Math.abs((this.car.speed.speedInMph + 
                car.speed.speedInMph)/ 2));
        }

        this.car.setSpeed(speed);
    }

    private distPerTimeStep(): number {
        return this.car.speed.mps() * TICK_DURATION;
    }

    private getCarAhead(): DrivingCar {
        let sameDirCars: DrivingCar[] = this.world.getCarsOnRoad(this.car.address.road)
            .filter(c => c.direction == this.car.direction && c !== this.car);

        let carAhead: DrivingCar = undefined;
        let minDist: number = Infinity;
        for (const car of sameDirCars) {
            let dist: number = getDistBetweenAddresses(this.car.address, car.address, 
                this.car.direction);
            if(dist > 0 && dist <= this.twoSecondRule() && dist < minDist) {
                carAhead = car;
            }
        }

        return carAhead;
    }

    // Gives safe driving distance from car ahead
    private twoSecondRule(): number {
        return 2 * this.car.speed.mps();
    }

    atIntersection(): Intersection {
        let intAddr: Address = followRoad(this.car.address, INTERSECTION_SIZE,
            this.car.direction);
        return this.world.network.getIntersectionFromAddr(intAddr);
    }
}