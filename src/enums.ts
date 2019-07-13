export enum IntersectionDirection {
    First,
    Second
};

export function switchDirection(dir: IntersectionDirection): IntersectionDirection {
    if(dir == IntersectionDirection.First) {
        return IntersectionDirection.Second;
    }
    return IntersectionDirection.First;
}