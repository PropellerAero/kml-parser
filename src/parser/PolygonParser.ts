import ParentParser from './ParentParser';
import { Tags } from './tags';
import { Polygon, AltitudeMode } from '../types/kml';
import LinearRingParser from './LinearRingParser';

export default class PolygonParser extends ParentParser<Polygon> {
    static Tag = Tags.Polygon;

    data: Polygon = {
        tessellate: 0,
    };

    openTag(name: string) {
        switch (name) {
            case Tags.Tessellate:
                this.awaitNumber().then((tessellate) => {
                    this.data.tessellate = tessellate;
                });

                break;
            case Tags.AltitudeMode:
                this.awaitText().then((altitudeMode) => {
                    this.data.altitudeMode = <AltitudeMode>altitudeMode;
                });

                break;
            case Tags.OuterBoundaryIs:
                this.await(this.parseLinearRing());
                break;
        }
    }

    async parseLinearRing() {
        const linearRingParser = new LinearRingParser(
            this.stream,
            this.options
        );
        const linearRing = await linearRingParser.parse();
        this.data.outerBoundary = linearRing;
    }
}
