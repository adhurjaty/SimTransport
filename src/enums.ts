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

export function otherDirection(dir: RoadDirection) {
    if(dir == RoadDirection.Charm) {
        return RoadDirection.Strange;
    }
    return RoadDirection.Charm;
}

export function directionParity(dir: RoadDirection) {
    return dir == RoadDirection.Charm ? 1 : -1;
}