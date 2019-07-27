import Intersection from "./intersection";
import LightSwitcher from "./light_switcher";
import { IntersectionDirection } from "../enums";

export default class TrafficLight {
    private switcher: LightSwitcher;
    public greenDirection: IntersectionDirection = IntersectionDirection.First;

    constructor(private intersection: Intersection) {
    }

    tick() {
        this.switcher && this.switcher.tick();
    }

    setSwitcher(switcher: LightSwitcher) {
        this.switcher = switcher;
    }
}