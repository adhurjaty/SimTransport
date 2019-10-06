import CarController from "./car_controller";
import DrivingCar from "./driving_car";
import World from "./world";
import { randomAddress } from "./simulator_helpers";
import Passenger from "./passenger";

export enum UberState {
    LOOKING,
    WITH_PASSENGER,
    PICKING_UP
}

export abstract class UberControllerBase extends CarController {
    public passenger: Passenger;

    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }


    protected wanderDest(): void {
        this.setDestination(randomAddress(this.world.network));
    }

    protected pickupPassenger(): void {
        this.passenger.pickup();
    }
}