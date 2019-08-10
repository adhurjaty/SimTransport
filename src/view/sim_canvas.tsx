import React, { RefObject, createRef } from "react";
import World from "../simulator/world";
import WorldView from "./world_view";
import { LineSegment } from "../interfaces/LineSegment";

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