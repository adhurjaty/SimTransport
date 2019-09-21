import DrivingCar from "../simulator/driving_car";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle, Coord } from "../util";
import { drawFilledPolygon } from "./view_helper";
import { GlobalParams } from "../constants"

export default class CarView extends ViewElement {
    private fillStyle: string = GlobalParams.CAR_COLOR;

    constructor(private car: DrivingCar, canvas: ICanvas) {
        super(canvas);
        this.car.setOnAtDest(this.turnRed.bind(this));
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let verts: Coord[] = this.car.getCarRectCoords();
        verts = verts.map(c => this.toCanvasCoords(c, viewRect));

        ctx.fillStyle = this.fillStyle;
        drawFilledPolygon(verts, ctx);
    }

    turnRed(): void {
        this.fillStyle = 'red';
    }
}