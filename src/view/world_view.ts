import World from "../simulator/world";
import { LineSegment } from "../interfaces/LineSegment";
import { Coord } from "../util";
import { Rectangle, flatten, constrainValue } from "../util";
import { ICanvas } from "./sim_canvas";
import ViewElement from "./view_element";
import RoadView from "./road_view";
import CarView from "./car_view";
import IntersectionView from "./intersection_view";

const MIN_VIEW_WIDTH = .005;

export default class WorldView extends ViewElement {
    private viewRect: Rectangle; // in world coords
    private roads: RoadView[];
    private intersections: IntersectionView[];
    private cars: CarView[];

    constructor(private world: World, canvas: ICanvas) {
        super(canvas);

        this.createViewRect();
        this.createRoads();
        this.createIntersections();
        this.createCars();
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.roads.forEach(road => {
            road.draw(ctx, this.viewRect);
        });
        this.intersections.forEach(int => {
            int.draw(ctx, this.viewRect);
        });
        this.cars.forEach(car => {
            car.draw(ctx, this.viewRect);
        });
    }

    toCanvasCoords(worldCoord: Coord): Coord {
        return super.toCanvasCoords(worldCoord, this.viewRect);
    }

    toWorldCoords(canvasCoord: Coord): Coord {
        return super.toWorldCoords(canvasCoord, this.viewRect);
    }

    toWorldSize(canvasSize: number): number {
        return super.toWorldSize(canvasSize, this.viewRect);
    }

    private createViewRect(): void {
        // center vertically if aspect ratios are different
        let bounds: Rectangle = this.world.getBounds();
        let aspectRatio: number = this.canvas.width / this.canvas.height;
        let height: number = bounds.width / aspectRatio;
        let y: number = (bounds.height - height) / 2 + bounds.y;
        this.viewRect = new Rectangle(bounds.x, y, bounds.width, height);
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

    zoom(canvasAmount: number, canvasLocation: Coord): void {
        let amount: number = -this.toWorldSize(canvasAmount);
        let newWidth: number = this.viewRect.width - amount;
        if(newWidth <= MIN_VIEW_WIDTH) {
            this.setViewByWidth(MIN_VIEW_WIDTH);
            return;
        }

        let worldBounds: Rectangle = this.world.getBounds();
        if(newWidth >= worldBounds.width) {
            this.setViewByWidth(worldBounds.width);
            this.viewRect.x = worldBounds.x;
            this.viewRect.y = worldBounds.y;
            return;
        }

        let newX: number = (this.viewRect.width - newWidth) 
            * canvasLocation.x / this.canvas.width + this.viewRect.x;
        let newHeight: number = newWidth / this.aspectRatio();
        let newY: number = (this.viewRect.height - newHeight) 
            * (this.canvas.height - canvasLocation.y) / this.canvas.height 
            + this.viewRect.y;

        let newRect: Rectangle = this.fitToBounds(
            new Rectangle(newX, newY, newWidth, newHeight), worldBounds);
        this.setViewRect(newRect);
    }

    pan(deltaCanvasCoord: Coord): void {
        let delta: Coord = new Coord( this.toWorldSize(deltaCanvasCoord.x),  this.toWorldSize(deltaCanvasCoord.y));
        let worldBounds: Rectangle = this.world.getBounds();

        this.viewRect = this.fitToBounds(new Rectangle(this.viewRect.x - delta.x,
            this.viewRect.y + delta.y, this.viewRect.width, this.viewRect.height),
            worldBounds);
    }

    private setViewByWidth(width: number) {
        this.viewRect.width = width;
        this.viewRect.height = width / this.aspectRatio();
    }

    private aspectRatio(): number {
        return this.canvas.width / this.canvas.height;
    }

    private fitToBounds(rect: Rectangle, bounds: Rectangle): Rectangle {
        rect.x = this.fitInDim(rect.x, rect.width, [bounds.x, bounds.x + bounds.width]);
        rect.y = this.fitInDim(rect.y, rect.height, 
            [bounds.y, bounds.y + bounds.height]);
        return rect;
    }

    private fitInDim(val: number, size: number, bound: [number, number]): number {
        val = Math.max(val, bound[0]);
        return Math.min(val + size, bound[1]) - size;
    }
}