import ParentParser from './ParentParser';
import { StyleMap } from '../types/kml';
import { Tags } from './tags';
import StylePairParser from './StylePairParser';

export default class StyleMapParser extends ParentParser<StyleMap> {
    static Tag = Tags.StyleMap;

    data: StyleMap = {
        id: this.options.attributes ? this.options.attributes.id : '',
        styles: {},
    };

    currentKey: string;

    openTag(name: string) {
        switch (name) {
            case Tags.Pair:
                this.await(this.parseStylePair());
                break;
        }
    }

    async parseStylePair() {
        const stylePairParser = new StylePairParser(this.stream, this.options);
        const stylePair = await stylePairParser.parse();
        this.data.styles[stylePair.key] = stylePair;
    }
}
