import BaseParser from './BaseParser';
import TextParser from './TextParser';
import CoordinatesParser from './CoordinatesParser';
import { AllHtmlEntities } from 'html-entities';
import CoordinateParser from './CoordinateParser';

const htmlEntities = new AllHtmlEntities();

export default class ParentParser<T> extends BaseParser<T> {
    awaitText(decode?: boolean) {
        return this.await(this.parseText(decode));
    }

    async parseText(decode?: boolean) {
        const textParser = new TextParser(this.stream);
        const text = await textParser.parse();
        return decode ? htmlEntities.decode(text) : text;
    }

    awaitNumber() {
        return this.await(this.parseNumber());
    }

    async parseNumber() {
        const text = this.parseText();
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
