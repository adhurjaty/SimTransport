import DrivingCar from "./driving_car";
import World from "./world";
import { UberControllerBase } from "./uber_controller_base";
import Passenger from "./passenger";



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
}