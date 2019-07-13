import ICoord from "./ICoord";

export default interface ControllableCar {
    speed: number;
    turnDuration: number;

    accelerate: () => void;
    brake: () => void;
    turnRight: () => void;
    turnLeft: () => void;
}