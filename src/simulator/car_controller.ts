import DrivingCar from "./driving_car";
import World from "./world";
import Address from "./address";
import PathInstruction from "./path_instruction";
import PathFinder from "./path_finder";
import { getCoord, getAddress, getRoadDistance, getDistBetweenAddresses, getDistToIntersection, getAddressOnRoad, followRoad, getDrivingDirection, getNewRoadDirection } from "./simulator_helpers";
import { Speed } from "../primitives";
import { TICK_DURATION, INTERSECTION_SIZE } from "../constants";
import { RoadDirection, otherDirection, DrivingDirection } from "../enums";
import { Coord } from "../util";
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
            this.car.atDest();
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
        return getDistBetweenAddresses(this.car.address, 
            getAddressOnRoad(this.car.address.road, this.path[0].location), 
            this.car.direction);
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
        if(this.makingRightTurn(intersection) && this.canMakeRightTurn(intersection)) {
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
        this.car.turning = true;
        this.makeDecision();
    }

    private getNextAddress(road: Road, intersectionLoc: Coord): Address {
        let addr: Address = new Address(road, getRoadDistance(road, road.path[0], 
            intersectionLoc));

        return addr;
    }

    private setForwardSpeed(distToWaypoint: number) {
        let speed: Speed = this.getSpeedLimit();

        let distToStop: number =this.stopDistance(distToWaypoint);

        // if car is so close to checkpoint that it will overshoot next time step
        if(distToStop - Number.EPSILON <= this.distPerTimeStep()) {
            speed = Speed.fromMps(distToStop / TICK_DURATION);
        }

        let [car, carDistance] = this.getCarAheadSameDir();
        if(car && (carDistance - car.size) < this.twoSecondRule()) {
            // preserve 2 second rule
            speed = Speed.fromMps((carDistance - car.size) / 2);
        }

        this.car.setSpeed(speed);
    }

    private stopDistance(distToWaypoint: number): number {
        let redLightDist: number = this.getRedLightDist();
        let turnDist: number = this.distToStopForTurn(distToWaypoint);
        return Math.min(turnDist, redLightDist, distToWaypoint);
    }

    private distToStopForTurn(distToWaypoint: number): number {
        let intersection: Intersection = this.getIntersectionAhead();
        let distToTurn: number = this.distToTurn(distToWaypoint);
        if(distToTurn - Number.EPSILON <= this.distPerTimeStep()) {
            if(this.makingLeftTurn(intersection) && !this.canMakeLeftTurn()) {
                return distToTurn;
            }
        }

        return Infinity;
    }

    private makingLeftTurn(intersection: Intersection): boolean {
        if(!this.isTurningIntersection(intersection)) {
            return false;
        }
        return this.makingDirectionTurn(DrivingDirection.Left);
    }

    private makingRightTurn(intersection: Intersection): boolean {
        if(!this.isTurningIntersection(intersection)) {
            return false;
        }
        return this.makingDirectionTurn(DrivingDirection.Right);
    }

    private isTurningIntersection(intersection: Intersection): boolean {
        if(this.path.length <= 1) {
            return false;
        }
        let nextAddress: Address = getAddress(this.world.network, this.path[1].location);
        return !!intersection.roads.find(r => r.id == nextAddress.road.id);
    }

    private makingDirectionTurn(dir: DrivingDirection) {
        if(this.path.length < 2) {
            return false;
        }

        return getDrivingDirection(this.path[1], this.path[0]) == dir;
    }

    private canMakeLeftTurn(): boolean {
        let [oncomingCar, dist] = this.getCarAheadOpposing();

        return this.canMakeTurn(oncomingCar, dist);
    }

    private canMakeRightTurn(intersection: Intersection): boolean {
        let otherRoad: Road = intersection.roads.find(r => r.id != 
            this.car.address.road.id);
        let addr: Address = getAddressOnRoad(otherRoad, intersection.location);
        let nextAddr: Address = getAddressOnRoad(otherRoad, this.path[1].location)
        let dir: RoadDirection = getNewRoadDirection(addr, nextAddr);
        let [oncomingCar, dist] = this.getCarOnNewRoad(addr, dir);
        
        return this.canMakeTurn(oncomingCar, dist);
    }

    private canMakeTurn(oncomingCar: DrivingCar, dist: number): boolean {
        if(!oncomingCar) {
            return true;
        }

        let lookDistance: number = this.car.turnTime * oncomingCar.speed.mps();
        
        return dist > lookDistance;
    }

    private distToTurn(distToWaypoint: number): number {
        // if waypoint is to the destination
        if(this.path.length <= 1) {
            return Infinity;
        }

        return distToWaypoint - INTERSECTION_SIZE;
    }

    private distPerTimeStep(): number {
        return this.car.speed.mps() * TICK_DURATION;
    }

    private getCarAheadSameDir(): [DrivingCar, number] {
        return this.getCarAhead(this.car.address, this.car.direction, 
            this.car.direction);
    }

    private getCarAheadOpposing(): [DrivingCar, number] {
        return this.getCarAhead(this.car.address, otherDirection(this.car.direction), 
            this.car.direction);
    }

    private getCarOnNewRoad(intersectionLoc: Address, dir: RoadDirection): 
        [DrivingCar, number]
    {
        return this.getCarAhead(intersectionLoc, dir, otherDirection(dir));
    }

    private getCarAhead(startAddr: Address, carDir: RoadDirection, 
        lookDir: RoadDirection): [DrivingCar, number] 
    {
        let dirCars: DrivingCar[] = this.world.getCarsOnRoad(startAddr.road)
            .filter(c => c.direction == carDir && c !== this.car);

        let carAhead: DrivingCar = undefined;
        let minDist: number = Infinity;
        for (const car of dirCars) {
            let dist: number = getDistBetweenAddresses(startAddr, car.address, lookDir);
            if(dist > 0 && dist < minDist) {
                carAhead = car;
                minDist = dist;
            }
        }

        return [carAhead, minDist];
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