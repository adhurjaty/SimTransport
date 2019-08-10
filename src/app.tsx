import * as ReactDOM from 'react-dom';
import * as React from 'react';
import SimCanvas from './view/sim_canvas';
import WorldBuilder from './simulator/world_builder';
import World from './simulator/world';
import { TICK_DURATION } from './constants';

let builder: WorldBuilder = new WorldBuilder();
let world: World = builder.build();

window.setInterval(world.tick, TICK_DURATION);

ReactDOM.render(
    <SimCanvas width={800} height={600} world={world} />
, document.getElementById("sim-canvas"));