import { merge } from 'lodash';
import { Attributes } from '../types/node-xml-stream';
import { Tags } from './tags';
import BaseParser, { ParserOptions } from './BaseParser';
import FolderParser from './FolderParser';
import { Design } from '../types/design';
import hexToLong from '../utils/hexToLong';
import { Folder, StyleMap, Style, Placemark } from '../types/kml';
import StyleMapParser from './StyleMapParser';
import ParserStream from './ParserStream';
import StyleParser from './StyleParser';
import PlacemarkParser from './PlacemarkParser';

const ENTITY_HANDLE_OFFSET = 10;
const DEFAULT_COLOR = 0xffdd00;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_FOLDER_NAME = 'DEFAULT';

export default class KmlParser extends BaseParser<Design> {
    data: Design;
    styleMaps: { [name: string]: StyleMap };
    styles: { [name: string]: Style };
    folders: Array<Folder>;

    constructor(stream: NodeJS.ReadableStream, options: ParserOptions = {}) {
        const parserStream = new ParserStream(stream);
        super(parserStream, options);
        this.data = {
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
        this.styleMaps = {};
        this.styles = {};
        this.folders = [];
    }

    openTag(name: string, attributes: Attributes) {
        switch (name) {
            case Tags.Folder:
                this.await(this.parseFolder());
                break;
            case Tags.StyleMap:
                this.await(this.parseStyleMap(attributes));
                break;
            case Tags.Style:
                this.await(this.parseStyle(attributes));
                break;
            case Tags.Placemark:
                this.await(this.parsePlacemark());
            default:
                break;
        }
    }

    async parseStyle(attributes: Attributes) {
        const styleParser = new StyleParser(this.stream, {
            ...this.options,
            attributes,
        });
        const style = await styleParser.parse();
        if (style.id) {
            this.styles[style.id] = style;
        }
    }

    async parseStyleMap(attributes: Attributes) {
        const styleMapParser = new StyleMapParser(this.stream, {
            ...this.options,
            attributes,
        });
        const styleMap = await styleMapParser.parse();
        this.styleMaps[styleMap.id] = styleMap;
    }

    async parseFolder() {
        const folderParser = new FolderParser(this.stream, this.options);
        const folder = await folderParser.parse();
        this.folders.push(folder);
    }

    async parsePlacemark() {
        const placemarkParser = new PlacemarkParser(this.stream, this.options);
        const placemark = await placemarkParser.parse();
        this.data.tables.layer.layers[DEFAULT_FOLDER_NAME] = {
            name: DEFAULT_FOLDER_NAME,
        };
        this.processPlacemark(placemark, DEFAULT_FOLDER_NAME);
    }

    getSharedEntityProperties(options: {
        layerName: string;
        color?: string;
        name?: string;
        description?: string;
    }) {
        const { layerName, color, name, description } = options;
        const customString = description || name;
        return {
            name,
            handle: `${ENTITY_HANDLE_OFFSET + this.data.entities.length}`,
            layer: layerName,
            color: color ? hexToLong(color) : DEFAULT_COLOR,
            extendedData: customString
                ? {
                      customStrings: [customString],
                  }
                : undefined,
        };
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

    processFolder(folder: Folder) {
        const { name: layerName, placemarks, folders, styles } = folder;

        this.styles = { ...this.styles, ...styles };

        folders.forEach((f) => this.processFolder(f));

        if (!placemarks.length) return;

        this.data.tables.layer.layers[layerName] = { name: layerName };

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
        } = placemark;

        const refStyle = this.getStyle(styleUrl);
        const { lineStyle, labelStyle }: Style = merge({}, refStyle, style);

        if (lineString) {
            this.data.entities.push({
                type: 'POLYLINE',
                vertices: lineString.coordinates || [],
                ...this.getSharedEntityProperties({
                    layerName,
                    name,
                    description,
                    color: lineStyle?.color,
                }),
            });
        }

        if (point) {
            const position = point.coordinate || DEFAULT_POSITION;

            if (name) {
                this.data.entities.push({
                    type: 'TEXT',
                    text: name,
                    position,
                    ...this.getSharedEntityProperties({
                        layerName,
                        name,
                        description,
                        color: labelStyle?.color,
                    }),
                });
            }

            this.data.entities.push({
                type: 'POINT',
                position,
                ...this.getSharedEntityProperties({
                    layerName,
                    name,
                    description,
                    color: labelStyle?.color,
                }),
            });
        }
    }

    finish() {
        Promise.all(this.awaiting).then(() => {
            this.folders.forEach((folder) => this.processFolder(folder));
            this.resolve(this.data);
        });
    }
}
