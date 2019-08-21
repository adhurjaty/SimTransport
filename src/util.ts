import { LineSegment } from "./interfaces/LineSegment";
import { Random } from "./primitives";

export function* tipTailGrouping<T>(lst: T[], size: number): 
    IterableIterator<T[]> 
{
    if(size <= 1) {
        throw new Error("Invalid argument: size must be greater than 1");
    }

    for (let i = 0; i < lst.length - (size - 1); i+=size-1) {
        yield [...Array(size).keys()].map((j) => lst[i+j]);
    }
}

export function segmentsIntersect(seg: LineSegment, other: LineSegment): Coord
{
    let xdiff: [number, number] = [seg[0].x - seg[1].x, other[0].x - other[1].x];
    let ydiff: [number, number] = [seg[0].y - seg[1].y, other[0].y - other[1].y];
    let div: number = determinant(xdiff, ydiff);

    if(div === 0) {
        return undefined;
    }

    let d: [number, number] = [determinant(toTuple(seg[0]), toTuple(seg[1])),
        determinant(toTuple(other[0]), toTuple(other[1]))];
    
    let x: number = determinant(d, xdiff) / div;
    let y: number = determinant(d, ydiff) / div;
    return new Coord(x, y);
}

export function isPointOnLine(seg: LineSegment, p: Coord): boolean {
    let vector: [number, number] = toTuple(makeOriginVector(seg));
    let transPoint: [number, number] = toTuple(makeOriginVector([seg[0], p]));
    let cross: number = determinant(vector, transPoint);
    if(Math.abs(cross) > Number.EPSILON) {
        return false;
    }

    let projection: number = dotProduct(vector, transPoint);
    return projection <= getDistance(seg) ** 2;
}

function toTuple(coord: Coord): [number, number] {
    return [coord.x, coord.y];
}

//#region  geometry

export function getDistance(seg: LineSegment): number {
    let vector: Coord = makeOriginVector(seg);
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
} 

function determinant(a: [number, number], b: [number, number]) {
    return a[0] * b[1] - b[0] * a[1];
}

function dotProduct(a: [number, number], b: [number, number]) {
    return a[0] * b[0] + a[1] * b[1];
}

function makeOriginVector(seg: LineSegment): Coord {
    return new Coord(seg[1].x - seg[0].x,  seg[1].y - seg[0].y);
}

export function scaleSegment(seg: LineSegment, scale: number): LineSegment {
    let base: Coord = seg[0];
    let newCoord: Coord = new Coord( base.x + (seg[1].x - base.x) * scale,  base.y + (seg[1].y - base.y) * scale);
    return [base, newCoord]; 
}

export function dotProduct90CCW(base: Coord, other: Coord): number {
    let rot90CCW: Coord = new Coord( -other.y,  other.x);
    return dotProduct(toTuple(base), toTuple(rot90CCW));
}

export function rotateCoord(coord: Coord, theta: number): Coord {
    return new Coord( coord.x * Math.cos(theta) - coord.y * Math.sin(theta),  coord.x * Math.sin(theta) + coord.y * Math.cos(theta));
}

export function topCenterRect(coord: Coord, width: number, height: number, 
    orientation: number): Coord[] 
{
    // create rectangle
    let rect: Coord[] = [
        new Coord( 0,  width / 2),
        new Coord( 0,  -width / 2),
        new Coord( -height,  -width /2),
        new Coord( -height,  width /2)
    ];

    // rotate and move
    return rect.map(c => {
        let rotated: Coord = rotateCoord(c, orientation);
        return new Coord(rotated.x + coord.x,  rotated.y + coord.y);
    });
}

export function scaleRect(coords: Coord[], factor: number): Coord[] {
    let center: Coord = new Coord((coords[2].x + coords[0].x) / 2,  (coords[2].y + coords[0].y) / 2);
    let offsetCoords: Coord[] = coords.map()
}

//#endregion

// returns indices of the values closest to 0 both positive and negative
// input list must be ordered least to greatest
export function getSortedSignChangeIndices(lst: number[]): [number, number] {
    for (let i = 0; i < lst.length; i++) {
        const el = lst[i];
        if(el > 0) {
            return (i > 0) ? [i - 1, i] : [-1, 0]
        }
    }

    return [lst.length - 1, -1];
}

export function randInt(start: number, end?: number): number {
    return Math.floor(randDouble(start, end));
}

export function randDouble(start: number, end?: number): number {
    if(end == undefined) {
        end = start;
        start = 0;
    }
    return (end - start) * Random.next() + start;
}

export function last<T>(lst: T[]): T {
    return lst[lst.length - 1];
}

export function flatten<T>(lst: T[][]): T[] {
    return [].concat(...lst);
}

export function constrainValue(val: number, bounds: [number, number]): number {
    return Math.min(bounds[1], Math.max(bounds[0], val));
}

export abstract class Queue<T> {
    protected elements: T[] = [];
    
    abstract push(el: T): void;

    peek(): T {
        if(this.elements.length == 0) {
            return undefined;
        }
        return this.elements[0];
    }

    pop(): T {
        if(this.elements.length == 0) {
            return undefined;
        }
        return this.elements.splice(0, 1)[0];
    }

    empty(): boolean {
        return this.elements.length == 0;
    }
}

export class PriorityQueue<T> extends Queue<T> {
    constructor(private hashFn: (a: T) => number) {
        super();
    }

    push(el: T): void {
        for (let i = 0; i < this.elements.length; i++) {
            const existing = this.elements[i];
            if(this.hashFn(el) < this.hashFn(existing)) {
                this.elements.splice(i, 0, el);
                return;
            }
        }
        this.elements.push(el);
    }
}

export class PrunableQueue<T> extends Queue<T> {
    constructor(elements: T[]) {
        super();
        this.elements = elements;
    }

    push(el: T): void {
        this.elements.push(el);
    }

    prune(lst: T[]) {
        for (const item of lst) {
            let idx: number = this.elements.indexOf(item);
            if(idx > -1) {
                this.elements.splice(idx, 1);
            }
        }
    }
}

export class Rectangle {
    constructor(public x: number, public y: number, public width: number,
        public height: number) {

    }
}

export class Coord {
    constructor(public x: number, public y: number) {
        
    }

    toTuple(): [number, number] {
        return [this.x, this.y];
    }

    distance(other: Coord): number {
        return Math.sqrt((this.x - other.x)**2 + (this.y - other.y)**2);
    }

    equals(other: Coord): boolean {
        return Math.abs(this.x - other.x) < Number.EPSILON 
            && Math.abs(this.y - other.y) < Number.EPSILON;
    }
}