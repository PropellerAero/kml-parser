import { compact } from 'lodash';
import BaseParser from './BaseParser';
import { Coordinate } from '../types/kml';
import { valueToCoordinates } from './CoordinateParser';

export default class CoordinatesParser extends BaseParser<Array<Coordinate>> {
    async text(value: string) {
        const coordinates = compact(value.split(/\s/)).map((chunk) => {
            const coordinate = valueToCoordinates(chunk);
            if (this.options.convertCoordinate) {
                return this.options.convertCoordinate(coordinate);
            }
            return coordinate;
        });
        this.resolve(coordinates);
    }
}
