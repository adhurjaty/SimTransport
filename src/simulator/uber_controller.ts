import DrivingCar from "./driving_car";
import CarController from "./car_controller";
import World from "./world";
import Address from "./address";
import Passenger from "./passenger";

enum UberState {
    LOOKING,
    WITH_PASSENGER,
    PICKING_UP
}

export default class UberController extends CarController {
    private state: UberState = UberState.LOOKING;

    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }

    makeDecision(): void {
        if(this.state == UberState.LOOKING) {
            if(!this.path) {
                let address: Address = this.findPassenger() || this.wanderDest();
                this.setDestination(address);
            }
        }

        super.makeDecision();
    }

    private findPassenger(): Address | null {
        let passengers: Passenger[] = this.world.passengers;
        if(!passengers) {
            return undefined;
        }

        return ;
    }

    private wanderDest(): Address {
        return new Address(this.world.map.roads[0], 0);
    }
}