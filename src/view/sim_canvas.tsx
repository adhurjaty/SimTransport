import React, { RefObject, createRef } from "react";
import World from "../simulator/world";
import WorldView from "./world_view";
import Coord from "../interfaces/Coord";

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
        this.handleStartDrag = this.handleStartDrag.bind(this);
        this.handleEndDrag = this.handleEndDrag.bind(this);
        this.handleDrag = this.handleDrag.bind(this);
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
        this.worldView.zoom(ZOOM_SPEED * e.deltaY, 
            this.relCoords({x: e.screenX, y: e.screenY}));
    }

    private curDragCoord?: Coord;
    handleStartDrag(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        this.curDragCoord = this.relCoords({x: e.screenX, y: e.screenY})
    }

    handleEndDrag(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        this.curDragCoord = undefined;
    }

    handleDrag(e: React.MouseEvent<HTMLCanvasElement, MouseEvent>): void {
        if(!this.curDragCoord) {
            return;
        }

        let newCoord: Coord = this.relCoords({x: e.screenX, y: e.screenY});
        let delta: Coord = {x: newCoord.x - this.curDragCoord.x,
            y: newCoord.y - this.curDragCoord.y};
        this.worldView.pan(delta);
        this.curDragCoord = newCoord;
    }

    private relCoords(screenCoords: Coord): Coord {
        let canvasBounds: ClientRect = this.canvasRef.current.getBoundingClientRect();
        return {x: screenCoords.x - canvasBounds.left,
            y: screenCoords.y - canvasBounds.top};
    }

    render() {
        return (
            <canvas ref={this.canvasRef} 
                    width={this.props.width} 
                    height={this.props.height}
                    onWheel={this.handleWheel}
                    onMouseDown={this.handleStartDrag}
                    onMouseUp={this.handleEndDrag}
                    onMouseMove={this.handleDrag}  />
        )
    }
} 