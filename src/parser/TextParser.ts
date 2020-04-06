import { XmlEntities } from 'html-entities';
import BaseParser from './BaseParser';

const xmlEntities = new XmlEntities();

export default class TextParser extends BaseParser<string> {
    data: string = '';

    text(value: string) {
        this.data = xmlEntities.decode(xmlEntities.decode(value));
    }

    cdata(value: string) {
        this.data = value;
    }

    closeTag() {
        this.resolve(this.data);
    }
}
