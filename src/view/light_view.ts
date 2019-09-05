import TrafficLight from "../simulator/traffic_light";
import ViewElement from "./view_element";
import { ICanvas } from "./sim_canvas";
import { Rectangle, Coord } from "../util";
import Intersection from "../simulator/intersection";
import Road from "../models/road";
import { LineSegment } from "../interfaces/LineSegment";
import { followRoad, getAddressOnRoad, getCoord } from "../simulator/simulator_helpers";
import Address from "../simulator/address";
import { RoadDirection } from "../enums";

const LIGHT_RADIUS = .0015;
const LIGHT_DISTANCE = .01;

export default class LightView extends ViewElement {
    constructor(private intersection: Intersection, canvas: ICanvas) {
        super(canvas);
    }

    draw(ctx: CanvasRenderingContext2D, viewRect: Rectangle): void {
        let center: Coord = this.intersection.location;
        let light: TrafficLight = this.intersection.light;

        let greenRoad: Road = this.intersection.roads[light.greenDirection];
        let redRoad: Road = this.intersection.roads.find(r => r.id != greenRoad.id);

        let greenPoints: LineSegment = this.getCanvasOpposing(center, greenRoad, viewRect);
        let redPoints: LineSegment = this.getCanvasOpposing(center, redRoad, viewRect);

        this.drawLights(ctx, viewRect, greenPoints, '#00ff00');
        this.drawLights(ctx, viewRect, redPoints, '#ff0000');
    }

    private getOpposingPoints(center: Coord, road: Road): LineSegment {
        let addr: Address = getAddressOnRoad(road, center);
        return <LineSegment>[RoadDirection.Charm, RoadDirection.Strange].map(dir =>
            getCoord(followRoad(addr, LIGHT_DISTANCE, dir)));
    }

    private getCanvasOpposing(center: Coord, road: Road, viewRect: Rectangle): LineSegment {
        return <LineSegment>this.getOpposingPoints(center, road).map(x => 
            this.toCanvasCoords(x, viewRect));
    }

    private drawLights(ctx: CanvasRenderingContext2D, viewRect: Rectangle,
        lightCenters: LineSegment, color: string) 
    {
        let rad = this.toCanvasSize(LIGHT_RADIUS, viewRect);
        
        ctx.fillStyle = color;
        for (const center of lightCenters) {
            ctx.beginPath();
            ctx.arc(center.x, center.y, rad, 0, 2 * Math.PI);
            ctx.fill();
        }    
    }
}