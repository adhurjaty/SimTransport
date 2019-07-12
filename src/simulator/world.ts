import RoadNetwork from "./road_network";
import DrivingCar from "./driving_car";
import RoadMap from "../models/road_map";

export default class World {
    public map: RoadMap
    constructor(public network: RoadNetwork, public cars: DrivingCar[]) {
        this.map = network.map;
    }
}