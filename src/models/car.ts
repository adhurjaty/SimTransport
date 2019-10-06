export default class Car {
    // size: miles
    // accel: mph/s
    // turnTime: seconds
    public passengerSeats: number = 4;

    constructor(public id: number, public size: number, public accel: number, 
        public turnTime: number) {}
}