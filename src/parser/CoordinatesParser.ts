import BaseParser from './BaseParser';
import { Coordinate } from '../types/kml';
import { valueToCoordinates } from './CoordinateParser';

export default class CoordinatesParser extends BaseParser<Array<Coordinate>> {
    async text(value: string) {
        const coordinates = value.split(' ').map((chunk) => {
            const coordinate = valueToCoordinates(chunk);
            if (this.options.convertCoordinate) {
                return this.options.convertCoordinate(coordinate);
            }
            return coordinate;
        });
        this.resolve(coordinates);
    }
}
