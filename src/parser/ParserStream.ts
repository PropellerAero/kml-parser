import XmlParser from 'node-xml-stream-parser';
import Parser from '../types/parser';
import { Attributes } from '../types/node-xml-stream';

export default class ParserStream {
    stream: NodeJS.ReadableStream;
    parsers: Array<Parser> = [];

    constructor(stream: NodeJS.ReadableStream) {
        const xml = new XmlParser();
        this.stream = stream.pipe(xml);
        this.stream.on('opentag', this.openTag);
        this.stream.on('closetag', this.closeTag);
        this.stream.on('text', this.text);
        this.stream.on('cdata', this.cdata);
        this.stream.on('finish', this.finish);
    }

    push(parser: Parser) {
        this.parsers.push(parser);
    }

    pop(parser: Parser) {
        if (parser === this.getParser()) {
            this.parsers.pop();
        }
    }

    getParser() {
        return this.parsers[this.parsers.length - 1];
    }

    openTag = (name: string, attributes: Attributes) => {
        const parser = this.getParser();
        // console.log(
        //     'Open',
        //     name,
        //     parser.constructor.name,
        //     this.parsers.map((p) => p.constructor.name)
        // );
        parser.openTag(name, attributes);
    };

    closeTag = (name: string) => {
        const parser = this.getParser();
        // console.log(
        //     'Close',
        //     name,
        //     parser.constructor.name,
        //     this.parsers.map((p) => p.constructor.name)
        // );
        parser.closeTag(name);
    };

    text = (text: string) => {
        this.getParser().text(text);
    };

    cdata = (text: string) => {
        this.getParser().cdata(text);
    };

    finish = () => {
        const parser = this.getParser();
        parser.finish();
    };
}
