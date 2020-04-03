import ParentParser from './ParentParser';
import { Style } from '../types/kml';
import { Tags } from './tags';
import LineStyleParser from './LineStyleParser';
import PolyStyleParser from './PolyStyleParser';

export default class StyleParser extends ParentParser<Style> {
    static Tag = Tags.Style;

    data: Style = {};

    openTag(name: string) {
        switch (name) {
            case Tags.LineStyle:
                this.await(this.parseLineStyle());
                break;
            case Tags.PolyStyle:
                const polyStyleParser = new PolyStyleParser(this.stream);
                this.await(this.parsePolyStyle());
                break;
        }
    }

    async parseLineStyle() {
        const lineStyleParser = new LineStyleParser(this.stream);
        const lineStyle = await lineStyleParser.parse();
        this.data.lineStyle = lineStyle;
    }

    async parsePolyStyle() {
        const polyStyleParser = new PolyStyleParser(this.stream);
        const polyStyle = await polyStyleParser.parse();
        this.data.polyStyle = polyStyle;
    }
}
