import React, { RefObject, createRef } from "react";
import World from "../simulator/world";

interface CanvasProps {
    width: number;
    height: number;
    world: World;
}

interface CanvasState {
    ctx: CanvasRenderingContext2D | null;
}

export default class SimCanvas extends React.Component<CanvasProps, {}> {
    private canvasRef: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>();
    private ctx: CanvasRenderingContext2D;

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if(canvas) {
            this.ctx = canvas.getContext("2d");
            this.drawBackground();
        }
    }

    drawBackground(): void {
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    }
    
    draw(): void {
        this.drawRoads();
        this.drawCars();
    }

    drawRoads(): void {
        
    }

    drawCars(): void {

    }

    render() {
        return (
            <div>
                <canvas ref={this.canvasRef} 
                        width={this.props.width} 
                        height={this.props.height} />
            </div>
        )
    }
} 