import DrivingCar from "./driving_car";
import CarController from "./car_controller";
import World from "./world";
import Address from "./address";
import Passenger from "./passenger";
import PathFinder from "./path_finder";
import PathInstruction from "./path_instruction";
import { getCoord, randomAddress } from "./simulator_helpers";
import { Coord, last } from "../util";
import { Random } from "../primitives";

enum UberState {
    LOOKING,
    WITH_PASSENGER,
    PICKING_UP
}

export default class UberController extends CarController {
    private state: UberState = UberState.LOOKING;
    
    public passenger: Passenger;

    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }

    makeDecision(): void {
        if(this.state == UberState.LOOKING) {
            this.findPassenger();
            if(!this.path) {
                this.wanderDest();
            }
        }

        super.makeDecision();
    }

    private findPassenger(): boolean {
        let passengers: Passenger[] = this.world.getLookingPassengers();
        if(!passengers) {
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

    private wanderDest(): void {
        this.setDestination(randomAddress(this.world.network));
    }

    handleAtDest(): void {
        if(this.state == UberState.PICKING_UP) {
            this.passenger.pickup();
            this.setDestination(this.passenger.dest);
            this.state = UberState.WITH_PASSENGER;
        }
        super.handleAtDest();
    }
}