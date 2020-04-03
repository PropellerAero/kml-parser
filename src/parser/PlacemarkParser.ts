import { AllHtmlEntities } from 'html-entities';
import { Placemark } from '../types/kml';
import { Tags } from './tags';
import LineStringParser from './LineStringParser';
import PointParser from './PointParser';
import ParentParser from './ParentParser';
import StyleParser from './StyleParser';

export default class PlacemarkParser extends ParentParser<Placemark> {
    static Tag = Tags.Placemark;

    data: Placemark = {};

    openTag(tagName: string) {
        switch (tagName) {
            case Tags.Description:
                this.awaitText(true).then(description => {
                    this.data.description = description;
                });
                break;
            case Tags.Name:
                this.awaitText().then(name => {
                    this.data.name = name;
                });
                break;
            case Tags.Style: {
                this.await(this.parseStyle());
                break;
            }
            case Tags.LineString: {
                this.await(this.parseLineString());
                break;
            }
            case Tags.Point: {
                this.await(this.parsePoint());
                break;
            }
        }
    }

    async parseStyle() {
        const styleParser = new StyleParser(this.stream);
        this.data.style = await styleParser.parse();
    }

    async parseLineString() {
        const lineStringParser = new LineStringParser(
            this.stream,
            this.options
        );
        const lineString = await lineStringParser.parse();
        this.data.lineString = lineString;
    }

    async parsePoint() {
        const pointParser = new PointParser(this.stream, this.options);
        const point = await pointParser.parse();
        this.data.point = point;
    }
}
