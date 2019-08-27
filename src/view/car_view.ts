import DrivingCar from "../simulator/driving_car";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle, topCenterRect } from "../util";
import { Coord } from "../util";
import { getCoord, getCarTheta } from "../simulator/simulator_helpers";
import { LANE_WIDTH, CAR_WIDTH, CAR_COLOR } from "../constants";
import { drawFilledPolygon } from "./view_helper";

export default class CarView extends ViewElement {
    constructor(private car: DrivingCar, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let verts: Coord[] = this.getCarRectCoords();
        verts = verts.map(c => this.toCanvasCoords(c, viewRect));

        ctx.fillStyle = CAR_COLOR;
        drawFilledPolygon(verts, ctx);
    }

    private getCarRectCoords(): Coord[] {
        let angle: number = getCarTheta(this.car);
        let perp: number = angle + -Math.PI / 2;
        let centerCoord: Coord = getCoord(this.car.address);
        let offsetVec: Coord = Coord.fromPolar(LANE_WIDTH / 2, perp);
        let newCenter: Coord = centerCoord.add(offsetVec);
        return topCenterRect(newCenter, CAR_WIDTH, this.car.size, angle);
    }
}