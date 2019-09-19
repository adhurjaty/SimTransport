import World from "../simulator/world";
import { GlobalParams } from "../constants";

export default class TimeController {
    private defaultTickDuration: number;
    private handle: number;
    
    public speedRatio: number = 1;
    public playing: boolean = false;
    
    constructor(private window: Window, private world: World) {
        this.defaultTickDuration = GlobalParams.TICK_DURATION;
        this.handle = 0;
    }

    setSimulationRate(ratio: number): void {
        GlobalParams.TICK_DURATION = ratio * this.defaultTickDuration;
        this.window.clearInterval(this.handle);
        this.speedRatio = ratio;
        this.handle = this.window.setInterval(this.world.tick.bind(this.world),
            this.defaultTickDuration);
    }

    toggleRunSimulation(): void {
        if(this.playing) {
            this.pauseSimulation();
        } else {
            this.playSimulation();
        }
    }

    playSimulation(): void {
        if(this.playing) {
            return;
        }
        this.setSimulationRate(this.speedRatio);
        this.playing = true;
    }

    pauseSimulation(): void {
        this.window.clearInterval(this.handle);
        this.playing = false;
    }
}