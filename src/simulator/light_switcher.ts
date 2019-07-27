import { IntersectionDirection } from "../enums";

export default interface LightSwitcher {
    tick(): void;
    setDirection(dir: IntersectionDirection): void;
    carSensorTripped(dir: IntersectionDirection): void;
}