import * as ReactDOM from 'react-dom';
import * as React from 'react';
import SimCanvas from './view/sim_canvas';
import WorldBuilder from './simulator/world_builder';
import World from './simulator/world';
import { GlobalParams } from './constants'
import makeTestWorld from './tests/test_world_builder';
import Player from './view/components/play_pause_button';
import TimeController from './view/time_controller';

const DEBUG = true;

let builder: WorldBuilder = new WorldBuilder();
let world: World = builder.build();
world.setRandomDestinations();

let timeController: TimeController = new TimeController(window, world);

if(!DEBUG) {
    timeController.playSimulation();
} else {
    world = makeTestWorld();
    timeController = new TimeController(window, world);
    timeController.setSimulationRate(1);
    timeController.pauseSimulation();
}
// <TEST WORLD>
// </TEST WORLD>

ReactDOM.render(
    <div className="container">
        <div className="row">
            <SimCanvas width={800} height={600} world={world} />
        </div>
        <div className="row debug-controls">
            <Player size={50} 
                    playing={timeController.playing} 
                    onToggle={timeController.toggleRunSimulation.bind(timeController)} />
        </div>
    </div>
, document.getElementById("sim-canvas"));