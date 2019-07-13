import TrafficLight from "./traffic_light";
import { IntersectionDirection, switchDirection } from "../enums";
import { TICK_DURATION } from "../constants";

const DURATION_THRESHOLD: number = 500;

export default class LightSwitcher {
    private greenDuration: number = 0;  // in time ticks
    private carsWaiting: number = 0;

    private waitingDuration: number = 0;

    constructor(private light: TrafficLight) {

    }

    tick() {
        if(this.carsWaiting > 0) {
            this.waitingDuration++;
        }
        this.greenDuration++;

        if(this.shouldSwitch()) {
            let newDir: IntersectionDirection = switchDirection(
                this.light.greenDirection);
            this.setDirection(newDir);
        }
    }

    shouldSwitch(): boolean {
        if(this.carsWaiting > 0 && this.waitingDuration >= DURATION_THRESHOLD) {
            return true;
        }

        return false;
    }

    setDirection(dir: IntersectionDirection) {
        this.light.greenDirection = dir;
        this.greenDuration = 0;
        this.waitingDuration = 0;
    }

    getDurationInSeconds(): number {
        return this.greenDuration * TICK_DURATION;
    }
}