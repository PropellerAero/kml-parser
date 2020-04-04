import XmlParser from 'node-xml-stream';
import { merge } from 'lodash';
import { Attributes } from '../types/node-xml-stream';
import { Tags } from './tags';
import BaseParser, { ParserOptions } from './BaseParser';
import FolderParser from './FolderParser';
import { Design, Layer } from '../types/design';
import hexToLong from '../utils/hexToLong';
import { Folder, StyleMap, Style } from '../types/kml';
import StyleMapParser from './StyleMapParser';

const ENTITY_HANDLE_OFFSET = 10;
const DEFAULT_COLOR = 0xffffff;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };
const DEFAULT_STYLE_KEY = 'normal';

export default class KmlParser extends BaseParser<Design> {
    static ScopedTags = [Tags.KML, Tags.Document];

    data: Design;
    styleMaps: { [name: string]: StyleMap };
    folders: Array<Folder>;

    constructor(stream: NodeJS.ReadableStream, options: ParserOptions = {}) {
        const xml = new XmlParser();
        const parserStream: NodeJS.ReadableStream = stream.pipe(xml);
        parserStream.setMaxListeners(100);
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
        this.folders = [];
    }

    openTag(name: string, attributes: Attributes) {
        switch (name) {
            case Tags.Folder: {
                this.await(this.parseFolder());
                break;
            }
            case Tags.StyleMap: {
                this.await(this.parseStyleMap(attributes));
            }
        }
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

    async parseFolder() {
        const folderParser = new FolderParser(this.stream, this.options);
        const folder = await folderParser.parse();
        this.folders.push(folder);
    }

    getStyleFromStyleMap(styleUrl?: string) {
        if (!styleUrl) return null;
        const styleMap = this.styleMaps[styleUrl.replace(/^#/, '')];
        return styleMap && styleMap.styles[DEFAULT_STYLE_KEY];
    }

    processFolder(folder: Folder) {
        const { name: layerName, placemarks, folders } = folder;

        folders.forEach(f => this.processFolder(f));

        if (!placemarks.length) return;

        this.data.tables.layer.layers[layerName] = { name: layerName };
        placemarks.forEach(placemark => {
            const {
                description,
                lineString,
                style,
                name,
                point,
                styleUrl,
            } = placemark;

            const refStyle = this.getStyleFromStyleMap(styleUrl);
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
        });
    }

    async parseStyleMap(attributes: Attributes) {
        const styleMapParser = new StyleMapParser(this.stream, {
            ...this.options,
            attributes,
        });
        const styleMap = await styleMapParser.parse();
        this.styleMaps[styleMap.id] = styleMap;
    }

    finish() {
        Promise.all(this.awaiting).then(() => {
            this.folders.forEach(folder => this.processFolder(folder));
            this.resolve(this.data);
        });
    }
}
