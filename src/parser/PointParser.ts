import ParentParser from './ParentParser';
import { Tags } from './tags';
import { Point } from '../types/kml';

export default class PointParser extends ParentParser<Point> {
    static Tag = Tags.Point;

    data: Point = {};

    openTag(name: string) {
        switch (name) {
            case Tags.Coordinates:
                this.awaitCoordinate().then(coordinate => {
                    this.data.coordinate = coordinate;
                });

                break;
        }
    }
}
