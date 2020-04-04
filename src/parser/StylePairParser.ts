import ParentParser from './ParentParser';
import { StylePair } from '../types/kml';
import { Tags } from './tags';
import StyleParser from './StyleParser';

export default class StylePairParser extends ParentParser<StylePair> {
    static Tag = Tags.Pair;

    data: StylePair = { key: '', style: {} };

    openTag(name: string) {
        switch (name) {
            case Tags.Key:
                this.awaitText().then(key => {
                    this.data.key = key;
                });
                break;
            case Tags.Style:
                this.await(this.parseStyle());
                break;
        }
    }

    async parseStyle() {
        const styleParser = new StyleParser(this.stream, this.options);
        const style = await styleParser.parse();
        this.data.style = style;
    }
}
