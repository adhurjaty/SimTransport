export default class Coord {
    constructor(public x: number, public y: number) {
        
    }

    toTuple(): [number, number] {
        return [this.x, this.y];
    }
}