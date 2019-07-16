import DrivingCar from "./driving_car";
import World from "./world";
import Address from "./address";

export default class CarController {
    public navPath: NavPath;

    constructor(private car: DrivingCar, private world: World) {

    }

    setDestination(addr: Address) {

    }
}