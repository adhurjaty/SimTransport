import Address from "./address";

enum PassengerState {
    LOOKING,
    FOUND,
    IN_CAR
}

export default class Passenger {
    public state: PassengerState = PassengerState.LOOKING;
    constructor(public address: Address, public dest: Address) {

    }

    isLooking(): boolean {
        return this.state == PassengerState.LOOKING;
    }

    notifyRide(): void {
        this.state = PassengerState.FOUND;
    }

    pickup(): void {
        this.state = PassengerState.IN_CAR;
    }
}