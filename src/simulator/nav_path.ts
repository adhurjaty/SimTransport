import Intersection from "./intersection";
import Address from "./address";

export default class NavPath {
    constructor(public startAddress: Address, public intersections: Intersection[], 
        public endAddress: Address)
    {

    }
}