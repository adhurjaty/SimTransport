export enum IntersectionDirection {
    First,
    Second
};

export enum RoadDirection {
    Charm,
    Strange
};

export enum DrivingDirection {
    Left,
    Right,
    Straight
};

export function switchDirection(dir: IntersectionDirection): IntersectionDirection {
    if(dir == IntersectionDirection.First) {
        return IntersectionDirection.Second;
    }
    return IntersectionDirection.First;
}