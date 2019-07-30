import { RoadDirection } from "./enums";

export class Speed {
    static fromMps(speed: number): Speed {
        return new Speed(speed * 3600);
    }

    constructor(public speedInMph: number) {

    }

    mps(): number {
        return this.speedInMph / 3600;
    }

    velocity(dir: RoadDirection): number {
        return (dir == RoadDirection.Charm ? 1 : -1) * this.speedInMph;
    }
}

export class Random {
    static next: () => number = () => {
        return Math.random();
    }
}