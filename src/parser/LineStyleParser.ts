import ParentParser from './ParentParser';
import { Tags } from './tags';
import { LineStyle } from '../types/kml';

export default class LineStyleParser extends ParentParser<LineStyle> {
    static Tag = Tags.LineStyle;

    data: LineStyle = {};

    openTag(name: string) {
        switch (name) {
            case Tags.Color:
                this.awaitText().then(color => {
                    this.data.color = color;
                });

                break;
            case Tags.Width:
                this.awaitNumber().then(width => {
                    this.data.width = width;
                });

                break;
        }
    }
}
