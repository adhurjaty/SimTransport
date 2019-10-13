import DrivingCar from "./driving_car";
import World from "./world";
import { UberControllerBase } from "./uber_controller_base";
import Passenger from "./passenger";
import PathInstruction from "./path_instruction";
import { DrivingDirection } from "../enums";
import { getDrivingDirection } from "./simulator_helpers";

const ACCEPTABLE_WASTED_TIME = 5 * 60;  // in seconds 
const LEFT_TURN_COST = 10; // seconds

export default class UberPoolController extends UberControllerBase {
    public passengers: Passenger[] = [];
    
    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }
    
    makeDecision(): void {
        if(this.passengers.length < this.car.passengerSeats) {
            this.findPassenger();
            if(!this.path || this.path.length == 0) {
                this.wanderDest();
            }
        }
    }

    private findPassenger(): boolean {
        let passengers: Passenger[] = this.world.getLookingPassengers();
        if(!passengers || passengers.length == 0) {
            return false;
        }


    }

    // calculates how much extra time a passenger needs to wait to pick up and drop off
    // a prospective next passenger
    private calculateWastedTime(passenger: Passenger): number {
        
    }

    private calculateRouteTime(path: PathInstruction[]): number {
        let totalDist: number = path.reduce((sum, x) => sum + x.distance, 0);
        let routeTime: number = totalDist / this.car.speedLimit.mps();
        routeTime += path.slice(1).reduce((turnTime, p, i) => {
            let turn: DrivingDirection = getDrivingDirection(p, path[i]);
            let turnCost: number = turn == DrivingDirection.Left ? LEFT_TURN_COST : 0;
            return turnTime + this.car.turnTime + turnCost;
        }, 0);

        return routeTime;        
    }
}