import { XmlEntities } from 'html-entities';
import BaseParser from './BaseParser';

const xmlEntities = new XmlEntities();

export default class TextParser extends BaseParser<string> {
    data: string = '';
    hasCData: boolean = false;

    text(value: string) {
        if (this.hasCData) return;
        this.data = xmlEntities.decode(xmlEntities.decode(value));
    }

    cdata(value: string) {
        this.hasCData = true;
        this.data = value;
    }

    closeTag() {
        this.resolve(this.data);
    }
}
