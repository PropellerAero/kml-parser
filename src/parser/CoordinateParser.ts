import BaseParser from './BaseParser';
import { Coordinate } from '../types/kml';

const removeSuffix = (value: string) => value.replace(/['"]/g, '');

export const valueToCoordinates = (value: string) => {
    const [x, y, z = 0] = value
        .split(',')
        .map((value) => Number(removeSuffix(value)));
    return { x, y, z };
};
export default class CoordinateParser extends BaseParser<Coordinate> {
    async text(value: string) {
        let coordinate = valueToCoordinates(value);
        if (this.options.convertCoordinate) {
            coordinate = this.options.convertCoordinate(coordinate);
        }
        this.resolve(coordinate);
    }
}
