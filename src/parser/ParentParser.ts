import { XmlEntities } from 'html-entities';
import BaseParser from './BaseParser';
import TextParser from './TextParser';
import CoordinatesParser from './CoordinatesParser';
import CoordinateParser from './CoordinateParser';

const xmlEntities = new XmlEntities();

export default class ParentParser<T> extends BaseParser<T> {
    awaitText() {
        return this.await(this.parseText());
    }

    parseText() {
        const textParser = new TextParser(this.stream);
        return textParser.parse();
    }

    awaitNumber() {
        return this.await(this.parseNumber());
    }

    async parseNumber() {
        const text = await this.parseText();
        return Number(text);
    }

    awaitCoordinates() {
        return this.await(this.parseCoordinates());
    }

    parseCoordinates() {
        const coordinatesParser = new CoordinatesParser(
            this.stream,
            this.options
        );
        return coordinatesParser.parse();
    }

    awaitCoordinate() {
        return this.await(this.parseCoordinate());
    }

    parseCoordinate() {
        const coordinateParser = new CoordinateParser(
            this.stream,
            this.options
        );
        return coordinateParser.parse();
    }
}
