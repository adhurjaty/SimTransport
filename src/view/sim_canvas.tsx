import React, { RefObject, createRef } from "react";
import World from "../simulator/world";
import WorldView from "./world_view";

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

const ZOOM_SPEED = .2;

export default class SimCanvas extends React.Component<CanvasProps, {}> {
    private canvasRef: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>();
    private ctx: CanvasRenderingContext2D;
    private worldView: WorldView;

    constructor(props: CanvasProps) {
        super(props);

        this.handleWheel = this.handleWheel.bind(this);
    }

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if(canvas) {
        this.worldView = new WorldView(this.props.world, this.canvasRef.current);
        this.ctx = canvas.getContext("2d");

            window.requestAnimationFrame(this.draw.bind(this));
        }
    }

    private drawBackground(): void {
        this.ctx.fillStyle = "green";
        this.ctx.fillRect(0, 0, this.props.width, this.props.height);
    }
    
    draw(): void {
        this.ctx.clearRect(0, 0, this.canvasRef.current.width, 
            this.canvasRef.current.height);
        this.drawBackground();
        this.worldView.draw(this.ctx);

        window.requestAnimationFrame(this.draw.bind(this));
    }

    handleWheel(e: React.WheelEvent<HTMLCanvasElement>): void {
        let canvasBounds: ClientRect = this.canvasRef.current.getBoundingClientRect();
        let relX: number = e.screenX - canvasBounds.left;
        let relY: number = e.screenY - canvasBounds.top;
        this.worldView.zoom(ZOOM_SPEED * e.deltaY, {x: relX, y: relY});
    }

    render() {
        return (
            <canvas ref={this.canvasRef} 
                    width={this.props.width} 
                    height={this.props.height}
                    onWheel={this.handleWheel}  />
        )
    }
} 