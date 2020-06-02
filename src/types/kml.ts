export type ConvertCoordinate = (coordinate: Coordinate) => Coordinate;

export enum AltitudeMode {
    RelativeToGround = 'relativeToGround',
    Absolute = 'absolute',
    RelativeToSeaFloor = 'relativeToSeaFloor',
    ClampToGround = 'clampToGround',
    clampToSeaFloor = 'clampToSeaFloor',
}

export type Folder = {
    name?: string;
    placemarks: Array<Placemark>;
    folders: Array<Folder>;
    styles: {
        [id: string]: Style;
    };
};

export type Placemark = {
    name?: string;
    description?: string;
    style?: Style;
    lineString?: LineString;
    point?: Point;
    styleUrl?: string;
    polygon?: Polygon;
    multiGeometry?: MultiGeometry;
    extendedData?: Array<ExtendedData>;
};

export type ExtendedData = {
    name?: string;
    value?: any;
};

export type LineStyle = {
    color?: string;
    width?: number;
};

export type PolyStyle = {
    color?: string;
    fill?: number;
    outline?: number;
};

export type LabelStyle = {
    color?: string;
    colorMode?: string;
    scale?: number;
};

export type StylePair = {
    key: string;
    style?: Style;
    styleUrl?: string;
};

export type StyleMap = {
    id: string;
    styles: {
        [key: string]: StylePair;
    };
};

export type Style = {
    id?: string;
    lineStyle?: LineStyle;
    polyStyle?: PolyStyle;
    labelStyle?: LabelStyle;
};

export type Polygon = {
    tessellate: number;
    altitudeMode?: AltitudeMode;
    innerBoundary?: LinearRing;
    outerBoundary?: LinearRing;
};

export type LinearRing = {
    coordinates?: Array<Coordinate>;
};

export type LineString = {
    altitudeMode?: AltitudeMode;
    coordinates?: Array<Coordinate>;
};

export type Point = {
    coordinate?: Coordinate;
};

export type MultiGeometry = {
    points: Array<Point>;
    lineStrings: Array<LineString>;
    polygons: Array<Polygon>;
};

export type Coordinate = {
    x: number;
    y: number;
    z: number;
};
