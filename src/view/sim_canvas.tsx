import React, { RefObject, createRef } from "react";
import World from "../simulator/world";
import WorldView from "./world_view";
import { LineSegment } from "../interfaces/LineSegment";
import ICoord from "../interfaces/ICoord";

export interface ICanvas {
    width: number;
    height: number;
} 

interface CanvasProps {
    width: number;
    height: number;
    world: World;
}

// interface CanvasState {
//     ctx: CanvasRenderingContext2D | null;
// }

export default class SimCanvas extends React.Component<CanvasProps, {}> {
    private canvasRef: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>();
    private ctx: CanvasRenderingContext2D;
    private worldView: WorldView;
    private lastDrawTime: Date;

    constructor(props: CanvasProps) {
        super(props);
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if(canvas) {
        this.worldView = new WorldView(this.props.world, this.canvasRef.current);
        this.ctx = canvas.getContext("2d");

            this.drawBackground();
            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    private drawBackground(): void {
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    }
    
    draw(): void {
        this.drawRoads();
        this.drawIntersections();
        this.drawCars();

        window.requestAnimationFrame(this.draw.bind(this));
    }

    private drawRoads(): void {
        this.ctx.strokeStyle = "black";

        let roadLines: LineSegment[] = this.worldView.getRoadLines();

        this.ctx.beginPath();
        roadLines.forEach(line => {
            this.ctx.moveTo(line[0].x, line[0].y);
            this.ctx.lineTo(line[1].x, line[1].y);
        });
        this.ctx.stroke();
        this.ctx.save();
    }

    private drawIntersections(): void {
        this.ctx.fillStyle = "black";

        let intersections: ICoord[] = this.worldView.getIntersectionLocations();

        let rad: number = 5;

        this.ctx.beginPath();
        intersections.forEach(c => {
            this.ctx.moveTo(c.x, c.y);
            this.ctx.arc(c.x, c.y, rad, 0, 2 * Math.PI);
        });
        this.ctx.fill();
        this.ctx.save();
    }

    private drawCars(): void {

    }

    render() {
        return (
            <canvas ref={this.canvasRef} 
                    width={this.props.width} 
                    height={this.props.height} />
        )
    }
} 