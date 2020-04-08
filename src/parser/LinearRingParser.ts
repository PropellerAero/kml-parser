import ParentParser from './ParentParser';
import { Tags } from './tags';
import { LinearRing } from '../types/kml';
import LineStringParser from './LineStringParser';

export default class LinearRingParser extends LineStringParser {
    static Tag = Tags.LinearRing;
}
