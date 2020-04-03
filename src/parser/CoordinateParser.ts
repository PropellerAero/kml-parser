import BaseParser from './BaseParser';
import { Coordinate } from '../types/kml';

export default class CoordinateParser extends BaseParser<Coordinate> {
    async text(value: string) {
        const [x, y, z = 0] = value.split(',').map(Number);
        let coordinate = { x, y, z };
        if (this.options.convertCoordinate) {
            coordinate = this.options.convertCoordinate(coordinate);
        }
        this.resolve(coordinate);
    }
}
