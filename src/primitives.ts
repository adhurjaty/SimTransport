export class Speed {
    static fromMps(speed: number): Speed {
        return new Speed(speed * 3600);
    }

    constructor(public speedInMph: number) {

    }

    mps(): number {
        return this.speedInMph / 3600;
    }
}