import DrivingCar from "./driving_car";
import World from "./world";
import Address from "./address";
import PathInstruction from "./path_instruction";
import PathFinder from "./path_finder";
import { getCoord, getAddress } from "./simulator_helpers";
import { Speed } from "../primitives";
import { TICK_DURATION, INTERSECTION_SIZE } from "../constants";
import { RoadDirection } from "../enums";

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
        let destAddr: Address = getAddress(this.world.network, this.path[0].location);

        let distToWaypoint: number = Math.abs(this.car.address.distance 
            - destAddr.distance);

        if(this.path.length == 1 && distToWaypoint <= Number.EPSILON) {
            this.path = [];
            this.car.setSpeed(new Speed(0));
            return;
        }
        
        distToWaypoint -= INTERSECTION_SIZE;
        if(distToWaypoint <= Number.EPSILON) {
            this.path.splice(0, 1);

            this.car.address = this.getNextAddress();
            this.car.direction = this.path[0].direction;
            this.car.setSpeed(this.getSpeedLimit());
        }

        // if car is so close to checkpoint that it will overshoot next time step
        if(distToWaypoint < this.distPerTimeStep()) {
            this.car.setSpeed(Speed.fromMps(distToWaypoint / TICK_DURATION));
        }
    }

    private distPerTimeStep(): number {
        return Math.abs(this.car.velocity.mps()) / TICK_DURATION;
    }

    private getNextAddress(): Address {
        let addr: Address = getAddress(this.world.network, 
            this.path[0].location);

        addr.distance += (this.path[0].direction == RoadDirection.Charm
            ? 1 : -1) * INTERSECTION_SIZE;

        return addr;
    }
}