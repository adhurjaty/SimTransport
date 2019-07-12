import ICoord from "./interfaces/ICoord";

export function* intersectionGrouping<T>(lst: T[], size: number): 
    IterableIterator<T[]> 
{
    if(size <= 1) {
        throw new Error("Invalid argument: size must be greater than 1");
    }

    for (let i = 0; i < lst.length - (size - 1); i+=size-1) {
        yield [...Array(size).keys()].map((j) => lst[i+j]);
    }
}

export function segmentsIntersect(seg: [ICoord, ICoord], 
    other: [ICoord, ICoord])
{
    let ccw: (a: ICoord, b: ICoord, c: ICoord) => boolean = (a, b, c) => {
        let s1: number = (b.y - a.y) * (c.x - a.x);
        let s2: number = (c.y - a.y) * (b.x - a.x);
        return (s1 < s2) || (s1 === 0 && s2 === 0);
    }

    return ccw(seg[0], other[0], other[1]) != ccw(seg[1], other[0], other[1])
        && ccw(seg[0], seg[1], other[0]) != ccw(seg[0], seg[1], other[1]);
}
