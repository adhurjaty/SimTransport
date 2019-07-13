import Intersection from "./intersection";
import LightSwitcher from "./light_switcher";
import { IntersectionDirection } from "../enums";

export default class TrafficLight {
    private switcher: LightSwitcher;
    public greenDirection: IntersectionDirection = IntersectionDirection.First;

    constructor(private intersection: Intersection) {
        this.switcher = new LightSwitcher(this);
    }

    tick() {
        this.switcher.tick();
    }
}