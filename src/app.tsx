import * as ReactDOM from 'react-dom';
import * as React from 'react';
import SimCanvas from './view/sim_canvas';
import WorldBuilder from './simulator/world_builder';
import World from './simulator/world';
import { GlobalParams } from './constants'
import makeTestWorld from './tests/test_world_builder';
import PlayPauseButton from './view/components/play_pause_button';
import TimeController from './view/time_controller';
import { SpeedRatioSetter } from './view/components/speed_ratio_setter';

const DEBUG = false;

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

ReactDOM.render(
    <div>
        <SimCanvas width={800} height={600} world={world} />
        <div className="button-grid">
            <PlayPauseButton playing={timeController.playing} 
                onToggle={timeController.toggleRunSimulation.bind(timeController)} />
            <SpeedRatioSetter ratio={timeController.speedRatio}
                onChange={timeController.setSimulationRate.bind(timeController)} /> 
        </div>
    </div>
, document.getElementById("sim-canvas"));