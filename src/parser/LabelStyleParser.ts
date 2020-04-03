import ParentParser from './ParentParser';
import { Tags } from './tags';
import { LabelStyle } from '../types/kml';

export default class LabelStyleParser extends ParentParser<LabelStyle> {
    static Tag = Tags.LabelStyle;

    data: LabelStyle = {};

    openTag(name: string) {
        switch (name) {
            case Tags.Color:
                this.awaitText().then(color => {
                    this.data.color = color;
                });
                break;
            case Tags.ColorMode:
                this.awaitText().then(colorMode => {
                    this.data.colorMode = colorMode;
                });
                break;
            case Tags.Scale:
                this.awaitNumber().then(scale => {
                    this.data.scale = scale;
                });
                break;
        }
    }
}
