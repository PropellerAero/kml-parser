import ParentParser from './ParentParser';
import { StylePair } from '../types/kml';
import { Tags } from './tags';
import StyleParser from './StyleParser';
import { Attributes } from '../types/node-xml-stream';

export default class StylePairParser extends ParentParser<StylePair> {
    static Tag = Tags.Pair;

    data: StylePair = { key: '' };

    openTag(name: string, attributes: Attributes) {
        switch (name) {
            case Tags.Key:
                this.awaitText().then((key) => {
                    this.data.key = key;
                });
                break;
            case Tags.Style:
                this.await(this.parseStyle(attributes));
                break;
            case Tags.StyleUrl:
                this.awaitText().then((styleUrl) => {
                    this.data.styleUrl = styleUrl;
                });
                break;
        }
    }

    async parseStyle(attributes: Attributes) {
        const styleParser = new StyleParser(this.stream, {
            ...this.options,
            attributes,
        });
        const style = await styleParser.parse();
        this.data.style = style;
    }
}
