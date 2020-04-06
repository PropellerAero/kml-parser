import { Tags } from './tags';
import { Folder } from '../types/kml';
import ParentParser from './ParentParser';
import PlacemarkParser from './PlacemarkParser';

export default class FolderParser extends ParentParser<Folder> {
    static Tag = Tags.Folder;

    data: Folder = {
        name: '',
        placemarks: [],
        folders: [],
    };

    openTag(tagName: string) {
        switch (tagName) {
            case Tags.Folder:
                this.await(this.parseChildFolder());
                break;

            case Tags.Name:
                this.awaitText().then((name) => {
                    this.data.name = name;
                });
                break;

            case Tags.Placemark:
                this.await(this.parsePlacemark());
                break;
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
