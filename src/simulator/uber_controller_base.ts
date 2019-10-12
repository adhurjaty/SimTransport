import CarController from "./car_controller";
import DrivingCar from "./driving_car";
import World from "./world";
import { randomAddress } from "./simulator_helpers";
import Passenger from "./passenger";
import { GlobalParams } from "../constants";

export enum UberState {
    LOOKING,
    WITH_PASSENGER,
    LOADING,
    PICKING_UP
}

export abstract class UberControllerBase extends CarController {
    private loadingTime: number = 0;
    
    protected state: UberState = UberState.LOOKING;
    private nextState: UberState = UberState.LOOKING;

    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }

    makeDecision(): void {
        if(this.state == UberState.LOADING) {
            this.loadingTime++;
            if(this.loadingTime * GlobalParams.TICK_DURATION >= GlobalParams.LOAD_TIME) {
                this.state = this.nextState;
                this.loadingTime = 0;
            } else {
                return;
            }
        }

        super.makeDecision();
    }

    protected wanderDest(): void {
        this.setDestination(randomAddress(this.world.network));
    }

    protected pickupPassenger(passenger: Passenger): void {
        if(passenger.address.equals(this.car.address)) {
            passenger.pickup();
            this.changeState(UberState.WITH_PASSENGER);
        }
    }

    protected changeState(state: UberState): void {
        if(this.state != UberState.LOADING) {
            this.state = UberState.LOADING;
            this.nextState = state;
        } else {
            this.state = state;
        }
    }
}