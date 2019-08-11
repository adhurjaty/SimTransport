import World from "../simulator/world";
import { LineSegment } from "../interfaces/LineSegment";
import ICoord from "../interfaces/ICoord";
import { Rectangle, flatten } from "../util";
import { ICanvas } from "./sim_canvas";
import ViewElement from "./view_element";
import RoadView from "./road_view";
import CarView from "./car_view";
import IntersectionView from "./intersection_view";

export default class WorldView {
    private viewRect: Rectangle; // in world coords
    private roads: RoadView[];
    private intersections: IntersectionView[];
    private cars: CarView[];

    constructor(private world: World, private canvas: ICanvas) {
        this.viewRect = world.getBounds();

        this.createRoads();
        this.createIntersections();
        this.createCars();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.roads.forEach(road => {
            road.draw(ctx, this.viewRect);
        });
        // this.intersections.forEach(int => {
        //     int.draw(ctx, this.viewRect);
        // });
        // this.cars.forEach(car => {
        //     car.draw(ctx, this.viewRect);
        // });
    }

    private createRoads(): void {
        this.roads = this.world.map.roads.map(road => new RoadView(road, this.canvas));
    }

    private createIntersections(): void {
        this.intersections = this.world.network.intersections.map(int => 
            new IntersectionView(int, this.canvas));
    }

    private createCars(): void {
        this.cars = this.world.cars.map(car => new CarView(car, this.canvas));
    }

    setViewRect(newRect: Rectangle) {
        this.viewRect = newRect;
    }

    getRoadLines(): LineSegment[] {
        return flatten(this.world.map.roads.map(r => Array.from(r.toLineSegments())))
            .map(l => <LineSegment>l.map(c => this.toCanvasCoords(c)));
    }

    getIntersectionLocations(): ICoord[] {
        return this.world.network.intersections.map(int => 
            this.toCanvasCoords(int.location));
    }

    toCanvasCoords(worldCoord: ICoord): ICoord {
        let xPrime: number = (worldCoord.x - this.viewRect.x) 
            * (this.canvas.width / this.viewRect.width);
        let yPrime: number = this.canvas.height - ((worldCoord.y - this.viewRect.y) 
            * (this.canvas.height / this.viewRect.height));
        return {x: xPrime, y: yPrime};
    }

    toWorldCoords(canvasCoords: ICoord): ICoord {
        let xPrime: number = (canvasCoords.x / (this.canvas.width / this.viewRect.width))
            + this.viewRect.x;
        let yPrime: number = (this.canvas.height - canvasCoords.y) 
            / (this.canvas.height / this.viewRect.height);
        return {x: xPrime, y: yPrime};
    }
}