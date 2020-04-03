import ParentParser from './ParentParser';
import { Tags } from './tags';
import { PolyStyle } from '../types/kml';

export default class PolyStyleParser extends ParentParser<PolyStyle> {
    static Tag = Tags.PolyStyle;

    data: PolyStyle = {};

    openTag(name: string) {
        switch (name) {
            case Tags.Color:
                this.awaitText().then(color => {
                    this.data.color = color;
                });
                break;
            case Tags.Fill:
                this.parseNumber().then(fill => {
                    this.data.fill = fill;
                });
                break;
            case Tags.Outline:
                this.parseNumber().then(outline => {
                    this.data.outline = outline;
                });
                break;
        }
    }
}
