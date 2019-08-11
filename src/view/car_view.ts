import DrivingCar from "../simulator/driving_car";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";

export default class CarView extends ViewElement {
    constructor(private car: DrivingCar, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D): void {
        
    }
}