import DrivingCar from "../simulator/driving_car";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle } from "../util";
import ICoord from "../interfaces/ICoord";
import { getCoord } from "../simulator/simulator_helpers";

export default class CarView extends ViewElement {
    constructor(private car: DrivingCar, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let drawCoord: ICoord = this.toCanvasCoords(getCoord(this.car.address), viewRect);
        let width: number = this.toCanvasSize(.003, viewRect); // in world coords in miles
        let length: number = this.toCanvasSize(this.car.size, viewRect);
        
        let verts: ICoord[] = [
            {x: drawCoord.x - width / 2, y: drawCoord.y},
            {x: drawCoord.x + width / 2, y: drawCoord.y},
            {x: drawCoord.x - width / 2, y: drawCoord.y + length},
            {x: drawCoord.x + width / 2, y: drawCoord.y + length},
        ];

        ctx.fillStyle = "blue";
        ctx.moveTo(verts[0].x, verts[0].y);
        verts.slice(1).forEach(vert => {
            ctx.lineTo(vert.x, vert.y);
        });
        ctx.fill();
        ctx.save();
    }
}