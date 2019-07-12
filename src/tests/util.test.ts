import { intersectionGrouping, segmentsIntersect } from "../util";
import ICoord from "../interfaces/ICoord";



test('intersection grouping 2', () => {
    let lst: number[] = [5, 2, 7, 3, 8, 2, 1];
    let expectation: number[][] = [[5, 2], [2, 7], [7, 3], [3, 8], [8, 2], [2, 1]];
    let result = Array.from(intersectionGrouping(lst, 2));
    expect(result).toEqual(expectation);
});

test('intersection grouping 3', () => {
    let lst: number[] = [5, 2, 6, 7, 3];
    let expectation: number[][] = [[5, 2, 6], [6, 7, 3]];
    let result = Array.from(intersectionGrouping(lst, 3));
    expect(result).toEqual(expectation);
});

test('origin intersects', () => {
    let seg: [ICoord, ICoord] = [
        {x: 0, y: 0},
        {x: 2, y: 0}
    ];
    let other: [ICoord, ICoord] = [
        {x: 0, y: 0},
        {x: 0, y: 2}
    ];

    let result: boolean = segmentsIntersect(seg, other);
    expect(result).toBeTruthy();
});