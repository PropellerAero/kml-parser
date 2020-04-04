import { Attributes } from '../types/node-xml-stream';
import { ConvertCoordinate } from '../types/kml';

type StreamEventHandler = (...args: any[]) => void;

export type ParserOptions = {
    convertCoordinate?: ConvertCoordinate;
    tag?: string;
    attributes?: Attributes;
};

type ParserConstructor = Function & {
    Tag: string;
    ScopedTags: Array<string>;
};

export default class BaseParser<T> {
    static Tag: string;
    data: T;
    options: ParserOptions;
    stream: NodeJS.ReadableStream;
    promise: Promise<T>;
    awaiting: Array<Promise<any>> = [];
    tagStack: Array<string> = [];
    scopedTags: Array<string>;
    resolveFn: (data: T) => void;
    rejectFn: (error: Error) => void;
    streamBindings: {
        [event: string]: StreamEventHandler;
    } = {};

    constructor(stream: NodeJS.ReadableStream, options: ParserOptions = {}) {
        this.options = options;
        this.stream = stream;
        this.promise = new Promise<T>((resolve, reject) => {
            this.resolveFn = resolve;
            this.rejectFn = reject;
        });
        this.on();
        const tag = this.getTag();
        const scopedTags: Array<string> = [];
        if (tag) {
            this.tagStack.push(tag);
            scopedTags.push(tag);
        }
        const constructor = <ParserConstructor>this.constructor;
        this.scopedTags = constructor.ScopedTags || scopedTags;
    }

    on() {
        this.bindStreamEvent('opentag', this.pushTagStack);
        this.bindStreamEvent('closetag', this.popTagStack);
        this.bindStreamEvent('text', this.text);
        this.bindStreamEvent('finish', this.finish);
    }

    off() {
        Object.keys(this.streamBindings).forEach(event => {
            this.stream.off(event, this.streamBindings[event]);
        });
    }

    bindStreamEvent(event: string, func: StreamEventHandler) {
        this.streamBindings[event] = (...args) => func.call(this, ...args);
        this.stream.on(event, this.streamBindings[event]);
    }

    pushTagStack(name: string, attributes: Attributes) {
        if (this.isInScope()) {
            this.openTag(name, attributes);
        }
        this.tagStack.push(name);
    }

    openTag(name: string, attributes: Attributes) {}

    popTagStack(name: string) {
        if (this.isInScope()) {
            this.closeTag(name);
        }
        this.tagStack.pop();
    }

    closeTag(name: string) {
        if (name === this.getTag()) {
            this.off();
            Promise.all(this.awaiting).then(() => {
                this.resolve(this.data);
            });
        }
    }

    text(text: string) {}

    finish() {}

    parse(): Promise<T> {
        return this.promise;
    }

    getTag() {
        const thisClass = <ParserConstructor>this.constructor;
        return this.options.tag || thisClass.Tag;
    }

    isInScope() {
        for (const index in this.tagStack) {
            if (this.tagStack[index] != this.scopedTags[index]) {
                return false;
            }
        }
        return true;
    }

    await<U>(promise: Promise<U>) {
        this.awaiting.push(promise);
        return promise;
    }

    resolve(data: T) {
        this.off();
        this.resolveFn(data);
    }

    reject(error: Error) {
        this.off();
        this.rejectFn(error);
    }
}
