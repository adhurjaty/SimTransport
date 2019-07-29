import Road from "../models/road";

export default class Address {
    constructor(public road: Road, public distance: number) {

    }

    equals(addr: Address): boolean {
        return this.road.id == addr.road.id 
            && Math.abs(this.distance - addr.distance) < Number.EPSILON;
    }
}