import { tipTailGrouping, segmentsIntersect, isPointOnLine, PriorityQueue, getSortedSignChangeIndices, dotProduct90CCW, flatten, topCenterRect, scaleRect, padRect } from "../util";
import { Coord } from "../util";
import { LineSegment } from "../interfaces/LineSegment";



test('intersection grouping 2', () => {
    let lst: number[] = [5, 2, 7, 3, 8, 2, 1];
    let expectation: number[][] = [[5, 2], [2, 7], [7, 3], [3, 8], [8, 2], [2, 1]];
    let result = Array.from(tipTailGrouping(lst, 2));
    expect(result).toEqual(expectation);
});

test('intersection grouping 3', () => {
    let lst: number[] = [5, 2, 6, 7, 3];
    let expectation: number[][] = [[5, 2, 6], [6, 7, 3]];
    let result = Array.from(tipTailGrouping(lst, 3));
    expect(result).toEqual(expectation);
});

test('origin intersects', () => {
    let seg: LineSegment = [
        new Coord( 0,  0),
        new Coord( 2,  0)
    ];
    let other: LineSegment = [
        new Coord( 0,  0),
        new Coord( 0,  2)
    ];

    let result: Coord = segmentsIntersect(seg, other);
    expect(result).toBeTruthy();
});

test('no intersection', () => {
    let seg: LineSegment = [
        new Coord( 0,  0),
        new Coord( 2,  0)
    ];
    let other: LineSegment = [
        new Coord( 0,  .3),
        new Coord( 4,  .3)
    ];

    let result: Coord = segmentsIntersect(seg, other);
    expect(result).toBeUndefined();    
});

test('point on line', () => {
    let seg: LineSegment = [
        new Coord( 0,  0),
        new Coord( 2,  0)
    ];
    let p: Coord = new Coord( .3,  0);

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point not on line', () => {
    let seg: LineSegment = [
        new Coord( 0,  0),
        new Coord( 2,  0)
    ];
    let p: Coord = new Coord( .3,  .01);

    expect(isPointOnLine(seg, p)).toBeFalsy();
});

test('point on diagonal line', () => {
    let seg: LineSegment = [
        new Coord( 1,  2),
        new Coord( 3,  6)
    ];
    let p: Coord = new Coord( 2.5,  5);

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point on line but not segment', () => {
    let seg: LineSegment = [
        new Coord( 0,  0),
        new Coord( 2,  0)
    ];
    let p: Coord = new Coord( 3,  0);

    expect(isPointOnLine(seg, p)).toBeFalsy();
});

test('insert number in priority queue', () => {
    let q: PriorityQueue<number> = new PriorityQueue<number>((a) => a);
    q.push(5);
    q.push(2);
    q.push(7);

    expect(q.pop()).toBe(2);
    expect(q.pop()).toBe(5);
    expect(q.pop()).toBe(7);
});

test('insert tuple in priority queue', () => {
    let q: PriorityQueue<[number, string]> = new PriorityQueue<[number, string]>(
        (a) => a[0]);
    q.push([5, 'second']);
    q.push([2, 'first']);
    q.push([7, 'third']);

    expect(q.pop()[1]).toEqual('first');
    expect(q.pop()[1]).toEqual('second');
    expect(q.pop()[1]).toEqual('third');
});

test('get sign change indices', () => {
    let lst: number[] = [-1, -.5, .1, 1.4];
    let result: [number, number] = getSortedSignChangeIndices(lst);

    expect(result).toEqual([1, 2]);
});

test('get sign change indices all neg', () => {
    let lst: number[] = [-2, -1.5, -1.1, -.4];
    let result: [number, number] = getSortedSignChangeIndices(lst);

    expect(result).toEqual([3, -1]);
});

test('get sign change indices all pos', () => {
    let lst: number[] = [1, 1.5, 2.1, 3.4];
    let result: [number, number] = getSortedSignChangeIndices(lst);

    expect(result).toEqual([-1, 0]);
});

test('get right vector', () => {
    let v1: Coord = new Coord( 1,  1);
    let v2: Coord = new Coord( 3,  0);

    expect(dotProduct90CCW(v1, v2) < 0).toBeFalsy();
});

test('get left vector', () => {
    let v1: Coord = new Coord( 1,  1);
    let v2: Coord = new Coord( -3,  0);

    expect(dotProduct90CCW(v1, v2) < 0).toBeTruthy();
});

test('flatten array', () => {
    let arr: number[][] = [
        [1, 5, 3],
        [1, 1, 1, 1],
        [3],
        [],
        [77, 3]
    ];

    let flat: number[] = flatten(arr);
    expect(flat).toEqual([1, 5, 3, 1, 1, 1, 1, 3, 77, 3]);
});

test('make rotated top center rectangle', () => {
    let rect: Coord[] = topCenterRect(new Coord( .5,  .3), .2, .5, Math.PI / 6);

    let expected: Coord[] = [
        new Coord( .45,  .3 + .1 * Math.sqrt(3)/2),
        new Coord( .55,  .3 - .1 * Math.sqrt(3)/2),
        new Coord( .55 - .5 * Math.sqrt(3)/2,  .3 - .1 * Math.sqrt(3)/2 - .25),
        new Coord( .45 - .5 * Math.sqrt(3)/2,  .3 + .1 * Math.sqrt(3)/2 - .25)
    ];

    rect.forEach((r, i) => {
        expect(r.x).toBeCloseTo(expected[i].x);
        expect(r.y).toBeCloseTo(expected[i].y);
    });
});

test('scale square', () => {
    let sq: Coord[] = [
        new Coord(0, 0),
        new Coord(0, 4),
        new Coord(4, 4),
        new Coord(4, 0)
    ];

    let scaled: Coord[] = scaleRect(sq, .5);
    let newSq: Coord[] = [
        new Coord(1, 1),
        new Coord(1, 3),
        new Coord(3, 3),
        new Coord(3, 1)
    ];

    for (let i = 0; i < sq.length; i++) {
        const sc = scaled[i];
        const exp = newSq[i];

        expect(sc.x).toBeCloseTo(exp.x);
        expect(sc.y).toBeCloseTo(exp.y);
    }
});

test('pad tilted square', () => {
    let sq: Coord[] = [
        new Coord(0, 4),
        new Coord(4, 8),
        new Coord(8, 4),
        new Coord(4, 0)
    ];

    let padded: Coord[] = padRect(sq, 1/Math.sqrt(2));
    let expected: Coord[] = [
        new Coord(1, 4),
        new Coord(4, 7),
        new Coord(7, 4),
        new Coord(4, 1)
    ];

    for (let i = 0; i < padded.length; i++) {
        const p = padded[i];
        const e = expected[i];

        expect(p.x).toBeCloseTo(e.x);
        expect(p.y).toBeCloseTo(e.y);
    }
});