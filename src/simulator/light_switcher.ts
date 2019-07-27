import { IntersectionDirection } from "../enums";

export default interface LightSwitcher {
    tick(): void;
    shouldSwitch(): boolean;
    setDirection(dir: IntersectionDirection): void;
    getDurationInSeconds(): number;
}