import XmlParser from 'node-xml-stream';
import { Attributes } from '../types/node-xml-stream';
import { Tags } from './tags';
import BaseParser, { ParserOptions } from './BaseParser';
import FolderParser from './FolderParser';
import { Design, Layer } from '../types/design';
import hexToLong from '../utils/hexToLong';

const ENTITY_HANDLE_OFFSET = 10;
const DEFAULT_COLOR = 0xffffff;
const DEFAULT_POSITION = { x: 0, y: 0, z: 0 };

export default class KmlParser extends BaseParser<Design> {
    data: Design;
    activeLayer: Layer;

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
    }

    isCurrentTag() {
        const documentIndex = this.tagStack.indexOf(Tags.Document);
        return documentIndex == -1 || documentIndex == this.tagStack.length - 1;
    }

    openTag(name: string, attributes: Attributes) {
        switch (name) {
            case Tags.Folder: {
                this.await(this.parseFolder());
                break;
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
            color: color ? hexToLong(color) : 0xffffff,
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
        const { name: layerName, placemarks } = folder;
        console.log(layerName);
        this.data.tables.layer.layers[layerName] = { name: layerName };
        placemarks.forEach(placemark => {
            const { description, lineString, style, name, point } = placemark;
            if (lineString) {
                this.data.entities.push({
                    type: 'POLYLINE',
                    vertices: lineString.coordinates || [],
                    ...this.getSharedEntityProperties({
                        layerName,
                        name,
                        description,
                        color: style?.lineStyle?.color,
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
                            color: style?.labelStyle?.color,
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
                        color: style?.labelStyle?.color,
                    }),
                });
            }
        });
    }

    finish() {
        Promise.all(this.awaiting).then(() => {
            this.resolve(this.data);
        });
    }
}
