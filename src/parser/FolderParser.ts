import { Tags } from './tags';
import { Folder } from '../types/kml';
import ParentParser from './ParentParser';
import PlacemarkParser from './PlacemarkParser';
import { Attributes } from '../types/node-xml-stream';
import StyleParser from './StyleParser';

export default class FolderParser extends ParentParser<Folder> {
    static Tag = Tags.Folder;

    data: Folder = {
        placemarks: [],
        folders: [],
        styles: {},
    };

    openTag(tagName: string, attributes: Attributes) {
        switch (tagName) {
            case Tags.Folder:
                this.await(this.parseChildFolder());
                break;

            case Tags.Name:
                this.awaitText().then((name) => {
                    if (name.trim()) {
                        this.data.name = name;
                    }
                });
                break;

            case Tags.Placemark:
                this.await(this.parsePlacemark());
                break;

            case Tags.Style:
                this.await(this.parseStyle(attributes));
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
            this.data.styles[style.id] = style;
        }
    }

    async parsePlacemark() {
        const placemarkParser = new PlacemarkParser(this.stream, this.options);
        const placemark = await placemarkParser.parse();
        this.data.placemarks.push(placemark);
    }

    async parseChildFolder() {
        const folderParser = new FolderParser(this.stream, this.options);
        const folder = await folderParser.parse();
        if (!folder.name) {
            this.data.placemarks.push(...folder.placemarks);
        } else {
            this.data.folders.push(folder);
        }
    }
}
