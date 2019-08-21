import { tipTailGrouping, segmentsIntersect, isPointOnLine, PriorityQueue, getSortedSignChangeIndices, dotProduct90CCW, flatten, topCenterRect } from "../util";
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
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let other: LineSegment = [
        {x: 0, y: 0},
        {x: 0, y: 2}
    ];

    let result: Coord = segmentsIntersect(seg, other);
    expect(result).toBeTruthy();
});

test('no intersection', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let other: LineSegment = [
        {x: 0, y: .3},
        {x: 4, y: .3}
    ];

    let result: Coord = segmentsIntersect(seg, other);
    expect(result).toBeUndefined();    
});

test('point on line', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: Coord = {x: .3, y: 0};

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point not on line', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: Coord = {x: .3, y: .01};

    expect(isPointOnLine(seg, p)).toBeFalsy();
});

test('point on diagonal line', () => {
    let seg: LineSegment = [
        {x: 1, y: 2},
        {x: 3, y: 6}
    ];
    let p: Coord = {x: 2.5, y: 5};

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point on line but not segment', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: Coord = {x: 3, y: 0};

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
    let v1: Coord = {x: 1, y: 1};
    let v2: Coord = {x: 3, y: 0};

    expect(dotProduct90CCW(v1, v2) < 0).toBeFalsy();
});

test('get left vector', () => {
    let v1: Coord = {x: 1, y: 1};
    let v2: Coord = {x: -3, y: 0};

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
    let rect: Coord[] = topCenterRect({x: .5, y: .3}, .2, .5, Math.PI / 6);

    let expected: Coord[] = [
        {x: .45, y: .3 + .1 * Math.sqrt(3)/2},
        {x: .55, y: .3 - .1 * Math.sqrt(3)/2},
        {x: .55 - .5 * Math.sqrt(3)/2, y: .3 - .1 * Math.sqrt(3)/2 - .25},
        {x: .45 - .5 * Math.sqrt(3)/2, y: .3 + .1 * Math.sqrt(3)/2 - .25}
    ];

    rect.forEach((r, i) => {
        expect(r.x).toBeCloseTo(expected[i].x);
        expect(r.y).toBeCloseTo(expected[i].y);
    });
});