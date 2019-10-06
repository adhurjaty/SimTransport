import DrivingCar from "./driving_car";
import CarController from "./car_controller";
import World from "./world";
import Passenger from "./passenger";
import PathFinder from "./path_finder";
import PathInstruction from "./path_instruction";
import { getCoord, randomAddress } from "./simulator_helpers";
import { Coord, last } from "../util";
import { Speed } from "../primitives";
import { UberControllerBase, UberState } from "./uber_controller_base";

export default class UberController extends UberControllerBase {
    private state: UberState = UberState.LOOKING;
    
    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }

    makeDecision(): void {
        if(this.state == UberState.LOOKING) {
            this.findPassenger();
            if(!this.path || this.path.length == 0) {
                this.wanderDest();
            }
        }

        super.makeDecision();
    }

    private findPassenger(): boolean {
        let passengers: Passenger[] = this.world.getLookingPassengers();
        if(!passengers || passengers.length == 0) {
            return false;
        }

        let pathFinder: PathFinder = new PathFinder(this.world.network);
        let carCoord: Coord = getCoord(this.car.address);
        let path: PathInstruction[] = pathFinder.getClosestPath(carCoord, 
            passengers.map(x => getCoord(x.address)));

        this.setPath(path);
        this.passenger = passengers.find(x => getCoord(x.address).equals(last(path).location));
        this.passenger.notifyRide();
        this.state = UberState.PICKING_UP;

        return true;
    }

    protected handleAtDest(): void {
        this.car.setSpeed(new Speed(0));
        this.path = [];

        if(this.state == UberState.PICKING_UP) {
            this.passenger.pickup();
            this.setDestination(this.passenger.dest);
            this.state = UberState.WITH_PASSENGER;
        } else if(this.state == UberState.WITH_PASSENGER) {
            this.world.dropOffPassenger(this.passenger);
            this.passenger = undefined;
            this.state = UberState.LOOKING;
        }

        this.car.atDest();
    }
}