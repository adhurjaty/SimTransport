import { tipTailGrouping, segmentsIntersect, isPointOnLine } from "../util";
import ICoord from "../interfaces/ICoord";
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

    let result: ICoord = segmentsIntersect(seg, other);
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

    let result: ICoord = segmentsIntersect(seg, other);
    expect(result).toBeUndefined();    
});

test('point on line', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: ICoord = {x: .3, y: 0};

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point not on line', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: ICoord = {x: .3, y: .01};

    expect(isPointOnLine(seg, p)).toBeFalsy();
});

test('point on diagonal line', () => {
    let seg: LineSegment = [
        {x: 1, y: 2},
        {x: 3, y: 6}
    ];
    let p: ICoord = {x: 2.5, y: 5};

    expect(isPointOnLine(seg, p)).toBeTruthy();
});

test('point on line but not segment', () => {
    let seg: LineSegment = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let p: ICoord = {x: 3, y: 0};

    expect(isPointOnLine(seg, p)).toBeFalsy();
});