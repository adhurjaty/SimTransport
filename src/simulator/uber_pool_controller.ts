import CarController from "./car_controller";
import DrivingCar from "./driving_car";
import World from "./world";



export default class UberPoolController extends CarController {
    constructor(car: DrivingCar, world: World) {
        super(car, world);
    }
    
    
}