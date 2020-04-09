import { Attributes } from '../types/node-xml-stream';
import { Tags } from './tags';
import BaseParser, { ParserOptions } from './BaseParser';
import FolderParser from './FolderParser';
import { Design } from '../types/design';
import { Folder } from '../types/kml';
import StyleMapParser from './StyleMapParser';
import ParserStream from '../stream/ParserStream';
import StyleParser from './StyleParser';
import PlacemarkParser from './PlacemarkParser';
import DesignBuilder from '../design/DesignBuilder';

const DEFAULT_FOLDER_NAME = 'DEFAULT';

export default class KmlParser extends BaseParser<Design> {
    builder: DesignBuilder;
    folders: Array<Folder>;

    constructor(stream: NodeJS.ReadableStream, options: ParserOptions = {}) {
        const parserStream = new ParserStream(stream);
        super(parserStream, options);
        this.builder = new DesignBuilder();
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
        this.builder.registerStyle(style);
    }

    async parseStyleMap(attributes: Attributes) {
        const styleMapParser = new StyleMapParser(this.stream, {
            ...this.options,
            attributes,
        });
        const styleMap = await styleMapParser.parse();
        this.builder.registerStyleMap(styleMap);
    }

    async parseFolder() {
        const folderParser = new FolderParser(this.stream, this.options);
        const folder = await folderParser.parse();
        this.folders.push(folder);
    }

    async parsePlacemark() {
        const placemarkParser = new PlacemarkParser(this.stream, this.options);
        const placemark = await placemarkParser.parse();
        this.builder.addLayer({
            name: DEFAULT_FOLDER_NAME,
        });
        this.builder.processPlacemark(placemark, DEFAULT_FOLDER_NAME);
    }

    finish() {
        Promise.all(this.awaiting).then(() => {
            this.folders.forEach((folder) =>
                this.builder.processFolder(folder)
            );
            this.resolve(this.builder.getDesign());
        });
    }
}
