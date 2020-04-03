import { Tags } from './tags';
import { Folder } from '../types/kml';
import ParentParser from './ParentParser';
import PlacemarkParser from './PlacemarkParser';

export default class FolderParser extends ParentParser<Folder> {
    static Tag = Tags.Folder;

    data: Folder = {
        name: 'DEFAULT',
        placemarks: [],
    };

    openTag(tagName: string) {
        switch (tagName) {
            case Tags.Name: {
                this.awaitText().then(name => {
                    this.data.name = name;
                });

                break;
            }
            case Tags.Placemark: {
                this.await(this.parsePlacemark());
                break;
            }
        }
    }

    async parsePlacemark() {
        const placemarkParser = new PlacemarkParser(this.stream, this.options);
        const placemark = await placemarkParser.parse();
        this.data.placemarks.push(placemark);
    }
}
