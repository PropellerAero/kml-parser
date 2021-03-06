import { merge } from 'lodash';
import {
    Style,
    Placemark,
    StyleMap,
    Folder,
    ExtendedData,
    LineString,
    Polygon,
    Point,
} from '../types/kml';
import { Layer, Design, Cartesian3 } from '../types/design';
import hexToLong from '../utils/hexToLong';

const ENTITY_HANDLE_OFFSET = 10;
const DEFAULT_COLOR = 0xffdd00;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_LINE_WIDTH = 1;
const DEFAULT_LAYER_NAME = 'DEFAULT';

type SharedEntitiyProperties = {
    color: number;
    layer: string;
    handle: string;
    name?: string;
    extendedData?: {
        [key: string]: Array<string>;
    };
};

type BaseBuildOptions = {
    layerName: string;
    style?: Style;
    name?: string;
    description?: string;
    extendedData?: Array<ExtendedData>;
};

type BuildPolylineOptions = {
    vertices: Array<Cartesian3>;
} & BaseBuildOptions;

type BuildPointOptions = {
    position: Cartesian3;
} & BaseBuildOptions;

type BuildTextOptions = {
    text: string;
} & BuildPointOptions;

export default class DesignBuilder {
    design: Design = {
        tables: {
            layer: {
                handle: '2',
                ownerHandle: '0',
                layers: {},
            },
        },
        header: [],
        entities: [],
        blocks: {},
    };

    styles: {
        [id: string]: Style;
    } = {};

    styleMaps: {
        [id: string]: StyleMap;
    } = {};

    registerStyle(style: Style) {
        if (style.id) {
            this.styles[style.id] = style;
        }
    }

    registerStyles(styles: { [id: string]: Style }) {
        Object.values(styles).forEach((style) => this.registerStyle(style));
    }

    registerStyleMap(styleMap: StyleMap) {
        this.styleMaps[styleMap.id] = styleMap;
    }

    addLayer(layer: Layer) {
        this.design.tables.layer.layers[layer.name] = layer;
    }

    processFolder(folder: Folder) {
        const {
            name: layerName = DEFAULT_LAYER_NAME,
            placemarks,
            folders,
            styles,
        } = folder;

        this.registerStyles(styles);

        folders.forEach((f) => this.processFolder(f));

        if (!placemarks.length) return;

        this.addLayer({ name: layerName });

        placemarks.forEach((placemark) => {
            this.processPlacemark(placemark, layerName);
        });
    }

    processPlacemark(
        placemark: Placemark,
        layerName: string = DEFAULT_LAYER_NAME
    ) {
        const {
            description,
            lineString,
            style,
            name,
            point,
            styleUrl,
            polygon,
            multiGeometry,
            extendedData,
        } = placemark;

        const refStyle = this.getStyle(styleUrl);
        const combinedStyle: Style = merge({}, refStyle, style);

        const processLineString = (lineString?: LineString) => {
            if (lineString && lineString.coordinates) {
                this.buildPolyline({
                    layerName,
                    style: combinedStyle,
                    vertices: lineString.coordinates,
                    name,
                    description,
                    extendedData,
                });
            }
        };

        const processPolygon = (polygon?: Polygon) => {
            if (
                polygon &&
                polygon.outerBoundary &&
                polygon.outerBoundary.coordinates
            ) {
                this.buildPolyline({
                    layerName,
                    style: combinedStyle,
                    vertices: polygon.outerBoundary.coordinates,
                    name,
                    description,
                    extendedData,
                });
            }
        };

        const processPoint = (point?: Point) => {
            if (point && point.coordinate) {
                const position = point.coordinate;

                if (name) {
                    this.buildText({
                        layerName,
                        text: name,
                        position,
                        name,
                        description,
                        style: combinedStyle,
                        extendedData,
                    });
                }

                this.buildPoint({
                    layerName,
                    position,
                    name,
                    description,
                    style: combinedStyle,
                    extendedData,
                });
            }
        };

        if (multiGeometry) {
            multiGeometry.lineStrings.forEach(processLineString);
            multiGeometry.polygons.forEach(processPolygon);
            multiGeometry.points.forEach(processPoint);
        }

        processLineString(lineString);
        processPolygon(polygon);
        processPoint(point);
    }

    buildPolyline({
        layerName,
        style,
        vertices,
        name,
        description,
        extendedData,
    }: BuildPolylineOptions) {
        this.design.entities.push({
            type: 'POLYLINE',
            vertices,
            lineWidth: style?.lineStyle?.width || DEFAULT_LINE_WIDTH,
            ...this.getSharedEntityProperties({
                layerName,
                name,
                description,
                color: style?.lineStyle?.color,
                extendedData,
            }),
        });
    }

    buildPoint({
        layerName,
        style,
        position,
        name,
        description,
        extendedData,
    }: BuildPointOptions) {
        this.design.entities.push({
            type: 'POINT',
            position,
            ...this.getSharedEntityProperties({
                layerName,
                name,
                description,
                color: style?.labelStyle?.color || style?.lineStyle?.color,
                extendedData,
            }),
        });
    }

    buildText({
        layerName,
        style,
        position,
        text,
        name,
        description,
        extendedData,
    }: BuildTextOptions) {
        this.design.entities.push({
            type: 'TEXT',
            text,
            position,
            ...this.getSharedEntityProperties({
                layerName,
                name,
                description,
                color: style?.labelStyle?.color,
                extendedData,
            }),
        });
    }

    getSharedEntityProperties(options: {
        layerName: string;
        color?: string;
        name?: string;
        description?: string;
        extendedData?: Array<ExtendedData>;
    }) {
        const { layerName, color, name, description, extendedData } = options;
        const customString = description || name;
        const properties: SharedEntitiyProperties = {
            handle: `${ENTITY_HANDLE_OFFSET + this.design.entities.length}`,
            layer: layerName,
            color: color ? hexToLong(color) : DEFAULT_COLOR,
        };

        if (name) {
            properties.name = name;
        }

        if (customString) {
            properties.extendedData = {
                customStrings: [customString],
            };
        }

        if (extendedData && extendedData.length) {
            const extendedDataProperties = {};
            extendedData.forEach(({ name, value }) => {
                if (name && value) {
                    extendedDataProperties[name] = [value];
                }
            });
            properties.extendedData = {
                ...properties.extendedData,
                ...extendedDataProperties,
            };
        }
        return properties;
    }

    getStyle(styleUrl?: string) {
        if (!styleUrl) return null;
        const id = styleUrl.replace(/^#/, '');

        if (this.styles[id]) {
            return this.styles[id];
        }

        const styleMap = this.styleMaps[id];
        return (
            styleMap &&
            merge(
                {},
                ...Object.values(styleMap.styles).map((stylePair) => {
                    return stylePair.style || this.getStyle(stylePair.styleUrl);
                })
            )
        );
    }

    getDesign() {
        return this.design;
    }
}
