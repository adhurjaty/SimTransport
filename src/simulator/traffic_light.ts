import Intersection from "./intersection";
import LightSwitcher from "./light_switcher";
import { IntersectionDirection } from "../enums";
import Road from "../models/road";

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

    tripSensor(road: Road) {
        if(this.switcher == undefined) {
            return;
        }
        let dir: IntersectionDirection = IntersectionDirection.First;
        let idx: number = this.intersection.roads.findIndex(x => x.id == road.id);
        if(idx == -1) {
            throw new Error("Road does not exist in intersection");
        }
        if(idx == 1) {
            dir = IntersectionDirection.Second;
        }
        this.switcher.carSensorTripped(dir);
    }
}