import ParentParser from './ParentParser';
import { Style } from '../types/kml';
import { Tags } from './tags';
import LineStyleParser from './LineStyleParser';
import PolyStyleParser from './PolyStyleParser';
import LabelStyleParser from './LabelStyleParser';

export default class StyleParser extends ParentParser<Style> {
    static Tag = Tags.Style;

    data: Style = {};

    openTag(name: string) {
        switch (name) {
            case Tags.LineStyle:
                this.await(this.parseLineStyle());
                break;
            case Tags.PolyStyle:
                this.await(this.parsePolyStyle());
                break;
            case Tags.LabelStyle:
                this.await(this.parseLabelStyle());
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

    async parseLabelStyle() {
        const labelStyleParser = new LabelStyleParser(this.stream);
        const labelStyle = await labelStyleParser.parse();
        this.data.labelStyle = labelStyle;
    }
}
