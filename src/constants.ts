export class GlobalParams {
    public static TICK_DURATION: number = .05;  // duration of each simulation tick in seconds
    public static HOUSE_SPACING: number = .01; // distance between houses (I'm saying miles)
    public static INTERSECTION_SIZE: number = .005; // size of an intersection (don't want to stop/start in the middle)
    public static LANE_WIDTH = .005;
    public static LANE_COLOR = '#545454';
    public static SIDEWALK_WIDTH = .002;
    public static SIDEWALK_COLOR = '#888c75';
    public static LINE_WIDTH = .0005;
    public static LINE_COLOR = '#fcfc00';
    public static CAR_WIDTH = .004;
    public static CAR_COLOR = 'blue';
    public static PASSENGER_LOAD_TIME = 20; // duration of passenger loading/unloading in uber (seconds)
    public static PASSENGER_WALK_SPEED = 2; // in mph
    public static LOAD_TIME = 30; // seconds to load and unload passenger
}
