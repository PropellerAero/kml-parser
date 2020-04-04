import { XmlEntities } from 'html-entities';
import BaseParser from './BaseParser';

const xmlEntities = new XmlEntities();

export default class TextParser extends BaseParser<string> {
    text(value: string) {
        this.resolve(xmlEntities.decode(xmlEntities.decode(value)));
    }
}
