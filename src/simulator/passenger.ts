import Address from "./address";
import { GlobalParams } from "../constants";

enum PassengerState {
    LOOKING,
    FOUND,
    WALKING,
    IN_CAR
}

export default class Passenger {
    private waitTicks: number = 0;
    private travelTicks: number = 0;
    private walkDest: Address;
    
    public state: PassengerState = PassengerState.LOOKING;

    constructor(public address: Address, public dest: Address) {

    }

    isLooking(): boolean {
        return this.state == PassengerState.LOOKING;
    }

    notifyRide(addr?: Address): void {
        if(addr) {
            this.walkDest = addr;
            this.state = PassengerState.WALKING;
        } else {
            this.state = PassengerState.FOUND;
        }
    }

    pickup(): void {
        this.state = PassengerState.IN_CAR;
    }

    tick(): void {
        if(this.state == PassengerState.IN_CAR) {
            this.travelTicks++;
        } else {
            this.waitTicks++;
        }

        if(this.state == PassengerState.WALKING) {
            
        }
    }

    getTotalTripTime(): number {
        return (this.waitTicks + this.travelTicks) * GlobalParams.TICK_DURATION;
    }
}