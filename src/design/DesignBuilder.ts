import { merge } from 'lodash';
import { Style, Placemark, StyleMap, Folder } from '../types/kml';
import { Layer, Design, Cartesian3 } from '../types/design';
import hexToLong from '../utils/hexToLong';

const ENTITY_HANDLE_OFFSET = 10;
const DEFAULT_COLOR = 0xffdd00;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_LINE_WIDTH = 1;

type SharedEntitiyProperties = {
    color: number;
    layer: string;
    handle: string;
    name?: string;
    extendedData?: {
        customStrings: Array<string>;
    };
};

type BaseBuildOptions = {
    layerName: string;
    style?: Style;
    name?: string;
    description?: string;
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
        const { name: layerName, placemarks, folders, styles } = folder;

        this.registerStyles(styles);

        folders.forEach((f) => this.processFolder(f));

        if (!placemarks.length) return;

        this.addLayer({ name: layerName });

        placemarks.forEach((placemark) => {
            this.processPlacemark(placemark, layerName);
        });
    }

    processPlacemark(placemark: Placemark, layerName: string) {
        const {
            description,
            lineString,
            style,
            name,
            point,
            styleUrl,
            polygon,
        } = placemark;

        const refStyle = this.getStyle(styleUrl);
        const combinedStyle: Style = merge({}, refStyle, style);

        if (lineString && lineString.coordinates) {
            this.buildPolyline({
                layerName,
                style: combinedStyle,
                vertices: lineString.coordinates,
                name,
                description,
            });
        }

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
            });
        }

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
                });
            }

            this.buildPoint({
                layerName,
                position,
                name,
                description,
                style: combinedStyle,
            });
        }
    }

    buildPolyline({
        layerName,
        style,
        vertices,
        name,
        description,
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
            }),
        });
    }

    buildPoint({
        layerName,
        style,
        position,
        name,
        description,
    }: BuildPointOptions) {
        this.design.entities.push({
            type: 'POINT',
            position,
            ...this.getSharedEntityProperties({
                layerName,
                name,
                description,
                color: style?.labelStyle?.color || style?.lineStyle?.color,
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
            }),
        });
    }

    getSharedEntityProperties(options: {
        layerName: string;
        color?: string;
        name?: string;
        description?: string;
    }) {
        const { layerName, color, name, description } = options;
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
