import WorldBuilder from "../simulator/world_builder";
import RoadMap from "../models/road_map";
import { createMap } from "./simulator.test";
import World from "../simulator/world";
import WorldView from "../view/world_view";

let map: RoadMap = createMap();
let builder: WorldBuilder = new WorldBuilder(map, []);
let world: World = builder.build();

test('convert to canvas coords', () => {
    let worldView = new WorldView(world)
});