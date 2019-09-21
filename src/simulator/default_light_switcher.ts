import TrafficLight from "./traffic_light";
import { IntersectionDirection, switchDirection } from "../enums";
import { GlobalParams } from "../constants"
import LightSwitcher from "./light_switcher";

const DURATION_THRESHOLD: number = 30;

export default class DefaultLightSwitcher implements LightSwitcher {
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

    private shouldSwitch(): boolean {
        if(this.carsWaiting > 0 && this.waitingDuration * GlobalParams.TICK_DURATION
            >= DURATION_THRESHOLD)
        {
            return true;
        }

        return false;
    }

    setDirection(dir: IntersectionDirection): void {
        this.light.greenDirection = dir;
        this.greenDuration = 0;
        this.waitingDuration = 0;
    }

    carSensorTripped(dir: IntersectionDirection): void {
        this.carsWaiting++;
    }
}