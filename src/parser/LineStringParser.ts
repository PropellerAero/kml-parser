import ParentParser from './ParentParser';
import { Tags } from './tags';
import { LineString, AltitudeMode } from '../types/kml';

export default class LineStringParser extends ParentParser<LineString> {
    static Tag = Tags.LineString;

    data: LineString = {};

    openTag(name: string) {
        switch (name) {
            case Tags.AltitudeMode:
                this.awaitText().then(altitudeMode => {
                    this.data.altitudeMode = <AltitudeMode>altitudeMode;
                });

                break;
            case Tags.Coordinates:
                this.awaitCoordinates().then(coordinates => {
                    this.data.coordinates = coordinates;
                });

                break;
        }
    }
}
