import { Attributes } from '../types/node-xml-stream';
import { ConvertCoordinate } from '../types/kml';
import Parser from '../types/parser';
import ParserStream from './ParserStream';

export type ParserOptions = {
    convertCoordinate?: ConvertCoordinate;
    tag?: string;
    attributes?: Attributes;
};

type ParserConstructor = Function & {
    Tag: string;
    ScopedTags: Array<string>;
};

export default class BaseParser<T> implements Parser {
    static Tag: string;
    data: T;
    options: ParserOptions;
    stream: ParserStream;
    promise: Promise<T>;
    awaiting: Array<Promise<any>> = [];
    resolveFn: (data: T) => void;
    rejectFn: (error: Error) => void;

    constructor(stream: ParserStream, options: ParserOptions = {}) {
        this.options = options;
        this.stream = stream;
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
        });
        this.stream.push(this);
    }

    openTag(name: string, attributes: Attributes) {}

    closeTag(name: string) {
        if (name === this.getTag()) {
            this.stream.pop(this);
            Promise.all(this.awaiting).then(() => {
                this.resolve(this.data);
            });
        }
    }

    text(text: string) {}

    cdata(text: string) {}

    finish() {}

    parse(): Promise<T> {
        return this.promise;
    }

    getTag() {
        const thisClass = <ParserConstructor>this.constructor;
        return this.options.tag || thisClass.Tag;
    }

    await<U>(promise: Promise<U>) {
        this.awaiting.push(promise);
        return promise;
    }

    resolve(data: T) {
        this.stream.pop(this);
        this.resolveFn(data);
    }

    reject(error: Error) {
        this.stream.pop(this);
        this.rejectFn(error);
    }
}
