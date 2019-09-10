import * as ReactDOM from 'react-dom';
import * as React from 'react';
import SimCanvas from './view/sim_canvas';
import WorldBuilder from './simulator/world_builder';
import World from './simulator/world';
import { GlobalParams } from './constants'
import makeTestWorld from './tests/test_world_builder';

let builder: WorldBuilder = new WorldBuilder();
let world: World = builder.build();
world.setRandomDestinations();

// <TEST WORLD>
world = makeTestWorld();
// </TEST WORLD>

window.setInterval(world.tick.bind(world), GlobalParams.TICK_DURATION);

ReactDOM.render(
    <SimCanvas width={800} height={600} world={world} />
, document.getElementById("sim-canvas"));