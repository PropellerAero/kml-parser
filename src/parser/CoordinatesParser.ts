import BaseParser from './BaseParser';
import { Coordinate } from '../types/kml';

export default class CoordinatesParser extends BaseParser<Array<Coordinate>> {
    async text(value: string) {
        const coordinates = value.split(' ').map(chunk => {
            const [x, y, z] = chunk.split(',').map(Number);
            const coordinate = { x, y, z };
            if (this.options.convertCoordinate) {
                return this.options.convertCoordinate(coordinate);
            }
            return coordinate;
        });
        this.resolve(coordinates);
    }
}
