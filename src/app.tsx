import * as ReactDOM from 'react-dom';
import * as React from 'react';
import SimCanvas from './view/sim_canvas';
import WorldBuilder from './simulator/world_builder';
import World from './simulator/world';

let builder: WorldBuilder = new WorldBuilder();
let world: World = builder.build();

ReactDOM.render(
    <SimCanvas width={800} height={450} /*world={world}*/ />
, document.body);