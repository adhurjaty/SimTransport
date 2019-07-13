import ICoord from "./interfaces/ICoord";
import { LineSegment } from "./interfaces/LineSegment";

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

export function segmentsIntersect(seg: LineSegment, other: LineSegment): ICoord
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
    return {x: x, y: y};
}

export function isPointOnLine(seg: LineSegment, p: ICoord): boolean {
    let vector: [number, number] = toTuple(makeOriginVector(seg));
    let transPoint: [number, number] = toTuple(makeOriginVector([seg[0], p]));
    let cross: number = determinant(vector, transPoint);
    if(Math.abs(cross) > .0001) {
        return false;
    }

    let projection: number = dotProduct(vector, transPoint);
    return projection < getDistance(seg) ** 2;
}

export function getDistance(seg: LineSegment): number {
    let vector: ICoord = makeOriginVector(seg);
    return Math.sqrt(vector.x ** 2 + vector.y ** 2);
} 

function determinant(a: [number, number], b: [number, number]) {
    return a[0] * b[1] - b[0] * a[1];
}

function dotProduct(a: [number, number], b: [number, number]) {
    return a[0] * b[0] + a[1] * b[1];
}


function makeOriginVector(seg: LineSegment): ICoord {
    return {x: seg[1].x - seg[0].x, y: seg[1].y - seg[0].y};
}

function toTuple(coord: ICoord): [number, number] {
    return [coord.x, coord.y];
}
