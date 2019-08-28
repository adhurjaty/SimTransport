import { IntersectionDirection } from "../enums";
import TrafficLight from "../simulator/traffic_light";
import LightSwitcher from "../simulator/light_switcher";
import RoadMap from "../models/road_map";
import Road from "../models/road";
import { Coord } from "../util";
import Car from "../models/car";


export function* defaultCars(num: number): IterableIterator<Car> {
    for(let i = 0; i < num; i++) {
        yield new Car(i, .005, 100, 3);
    }
}

export function createMap(): RoadMap {
    let creator: MapCreator = new MapCreator(2, .1);
    return creator.createMap(5);
}

class MapCreator {
    private roadID: number = 0;
    private numRoads: number;
    constructor(private roadLen: number, private roadSeparation: number) {

    }

    createMap(num: number): RoadMap {
        this.numRoads = num;
        let grid: Road[] = this.generateGrid();
        return new RoadMap(grid);
    }

    private generateGrid(): Road[] {
        return Array.from(this.createRoadRows(this.numRoads))
            .concat(Array.from(this.createRoadColumns(this.numRoads)));
    }
    
    private *createRoadRows(numRoads: number): IterableIterator<Road> {
        yield* this.createRoads(numRoads, this.makeHorizontalPath.bind(this));
    }
    
    private *createRoadColumns(numRoads: number): IterableIterator<Road> {
        yield* this.createRoads(numRoads, this.makeVerticalPath.bind(this));
    }
    
    private *createRoads(numRoads: number, coordCreator: (n: number) => Coord[]): 
        IterableIterator<Road> 
    {
        for (let i = 0; i < numRoads; i++) {
            let path = coordCreator(i);
            yield new Road(this.roadID, path, 1, 1);
            this.roadID++;
        }
    }
    
    private makeHorizontalPath(roadNum: number): Coord[] {
        return [new Coord(0, roadNum * this.roadSeparation), 
            new Coord(this.roadLen, roadNum * this.roadSeparation)];
    }
    
    private makeVerticalPath(roadNum: number): Coord[] {
        return [new Coord(roadNum * this.roadSeparation, 0), 
            new Coord(roadNum * this.roadSeparation, this.roadLen)];
    }
}

export class SimpleLightSwitcher implements LightSwitcher {
    constructor(protected light: TrafficLight, protected direction: IntersectionDirection) {
        this.light.setSwitcher(this);
        light.greenDirection = this.direction;
    }

    tick(): void {}
    setDirection(dir: IntersectionDirection): void {}
    carSensorTripped(dir: IntersectionDirection): void {}
}

export class AutoSwitcher implements LightSwitcher {
    constructor(private light: TrafficLight) {
    }

    tick(): void {}
    setDirection(dir: IntersectionDirection): void {}
    carSensorTripped(dir: IntersectionDirection): void {
        this.light.greenDirection = dir;
    }
}

export class TrippedTestSwitcher extends SimpleLightSwitcher {
    public trippedDirs: IntersectionDirection[] = []
    constructor(light: TrafficLight, direction: IntersectionDirection) {
        super(light, direction);
    }

    carSensorTripped(dir: IntersectionDirection): void {
        this.trippedDirs.push(dir);
    }
}