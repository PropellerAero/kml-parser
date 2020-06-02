import { Placemark } from '../types/kml';
import { Tags } from './tags';
import LineStringParser from './LineStringParser';
import PointParser from './PointParser';
import PolygonParser from './PolygonParser';
import ParentParser from './ParentParser';
import StyleParser from './StyleParser';
import ExtendedDataParser from './ExtendedDataParser';
import { Attributes } from '../types/node-xml-stream';
import MultiGeometryParser from './MultiGeometry';

export default class PlacemarkParser extends ParentParser<Placemark> {
    static Tag = Tags.Placemark;

    data: Placemark = {};

    openTag(tagName: string, attributes: Attributes) {
        switch (tagName) {
            case Tags.Description:
                this.awaitText().then((description) => {
                    this.data.description = description;
                });
                break;

            case Tags.Name:
                this.awaitText().then((name) => {
                    if (name.trim()) {
                        this.data.name = name;
                    }
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

            case Tags.LineString:
                this.await(this.parseLineString());
                break;

            case Tags.Point:
                this.await(this.parsePoint());
                break;

            case Tags.Polygon:
                this.await(this.parsePolygon());
                break;

            case Tags.ExtendedData:
                this.await(this.parseExtendedData());
                break;

            case Tags.MultiGeometry:
                this.await(this.parseMultiGeometry());
                break;
        }
    }

    async parseStyle(attributes: Attributes) {
        const styleParser = new StyleParser(this.stream, attributes);
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

    async parsePolygon() {
        const polygonParser = new PolygonParser(this.stream, this.options);
        const polygon = await polygonParser.parse();
        this.data.polygon = polygon;
    }

    async parseMultiGeometry() {
        const multiGeometryParser = new MultiGeometryParser(
            this.stream,
            this.options
        );
        const multiGeometry = await multiGeometryParser.parse();
        this.data.multiGeometry = multiGeometry;
    }

    async parseExtendedData() {
        const extendedDataParser = new ExtendedDataParser(
            this.stream,
            this.options
        );
        const extendedData = await extendedDataParser.parse();
        this.data.extendedData = extendedData;
    }
}
