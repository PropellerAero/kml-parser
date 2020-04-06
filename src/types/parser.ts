import { Attributes } from './node-xml-stream';

export default interface Parser {
    openTag(name: string, attributes: Attributes): any;
    closeTag(name: string): any;
    text(text: string): any;
    cdata(text: string): any;
    finish(): any;
}
