import WorldBuilder from "../simulator/world_builder";
import RoadMap from "../models/road_map";
import { createMap } from "./simulator.test";
import World from "../simulator/world";
import WorldView from "../view/world_view";
import { ICanvas } from "../view/sim_canvas";
import Coord from "../models/coord";
import ICoord from "../interfaces/ICoord";
import { Rectangle } from "../util";

let map: RoadMap = createMap();
let builder: WorldBuilder = new WorldBuilder(map, []);
let world: World = builder.build();

test('convert to canvas coords', () => {
    let canvas: ICanvas = {width: 800, height: 600};
    let worldView: WorldView = new WorldView(world, canvas);

    let coord: Coord = new Coord(1.0, 0.5);
    let canvasCoord: ICoord = worldView.toCanvasCoords(coord);

    expect(canvasCoord.x).toBeCloseTo(400);
    expect(canvasCoord.y).toBeCloseTo(450);
});

test('convert to world coords', () => {
    let canvas: ICanvas = {width: 800, height: 600};
    let worldView: WorldView = new WorldView(world, canvas);

    let coord: Coord = new Coord(200, 450);
    let worldCoord: ICoord = worldView.toWorldCoords(coord);

    expect(worldCoord.x).toBeCloseTo(0.5);
    expect(worldCoord.y).toBeCloseTo(0.5);
});

test('convert to canvas coords zoomed', () => {
    let canvas: ICanvas = {width: 800, height: 600};
    let worldView: WorldView = new WorldView(world, canvas);
    worldView.setViewRect(new Rectangle(.2, .4, 1, 1));

    let coord = new Coord(.7, 1.4);
    let canvasCoord: ICoord = worldView.toCanvasCoords(coord);

    expect(canvasCoord.x).toBeCloseTo(400);
    expect(canvasCoord.y).toBeCloseTo(0);
});



