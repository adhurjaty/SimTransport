import DrivingCar from "../simulator/driving_car";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle, topCenterRect } from "../util";
import ICoord from "../interfaces/ICoord";
import { getCoord, getRoadTheta } from "../simulator/simulator_helpers";

export default class CarView extends ViewElement {
    constructor(private car: DrivingCar, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let drawCoord: ICoord = this.toCanvasCoords(getCoord(this.car.address), viewRect);
        let width: number = this.toCanvasSize(.003, viewRect) + 10;
        let length: number = this.toCanvasSize(this.car.size, viewRect) + 10;
        
        let angle: number = getRoadTheta(this.car.address, this.car.direction);
        let verts: ICoord[] = topCenterRect(drawCoord, width, length, angle) ;

        ctx.beginPath();
        ctx.moveTo(verts[0].x, verts[0].y);
        verts.slice(1).forEach(vert => {
            ctx.lineTo(vert.x, vert.y);
        });
        ctx.fillStyle = "blue";
        ctx.fill();
    }
}