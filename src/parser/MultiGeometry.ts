import { Tags } from './tags';
import ParentParser from './ParentParser';
import { MultiGeometry } from '../types/kml';
import LineStringParser from './LineStringParser';
import PointParser from './PointParser';
import PolygonParser from './PolygonParser';

export default class MultiGeometryParser extends ParentParser<MultiGeometry> {
    static Tag = Tags.MultiGeometry;

    data: MultiGeometry = {
        points: [],
        polygons: [],
        lineStrings: [],
    };

    openTag(name: string) {
        switch (name) {
            case Tags.LineString:
                this.await(this.parseLineString());
                break;

            case Tags.Polygon:
                this.await(this.parseLineString());
                break;

            case Tags.Point:
                this.await(this.parseLineString());
                break;
        }
    }

    async parseLineString() {
        const lineStringParser = new LineStringParser(
            this.stream,
            this.options
        );
        const lineString = await lineStringParser.parse();
        this.data.lineStrings.push(lineString);
    }

    async parsePolygon() {
        const polygonParser = new PolygonParser(this.stream, this.options);
        const polygon = await polygonParser.parse();
        this.data.polygons.push(polygon);
    }

    async parsePoint() {
        const pointParser = new PointParser(this.stream, this.options);
        const point = await pointParser.parse();
        this.data.points.push(point);
    }
}
