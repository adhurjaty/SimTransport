import React, { RefObject, createRef } from "react";

type CanvasProps = {
    width: number;
    height: number;
}

export default class SimCanvas extends React.Component<CanvasProps, {}> {
    private canvasRef: RefObject<HTMLCanvasElement> = createRef<HTMLCanvasElement>(); 

    componentDidMount() {
        const canvas = this.canvasRef.current;
        if(canvas) {
            const ctx = canvas.getContext("2d");
            ctx.fillStyle = "black";
            ctx.fillRect(0, 0, this.props.width, this.props.height);
        }
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