export default class Coord {
    constructor(public x: number, public y: number) {
        
    }

    toTuple(): [number, number] {
        return [this.x, this.y];
    }

    distance(other: Coord): number {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }

    equals(other: Coord): boolean {
        return this.x == other.x && this.y == other.y;
    }
}