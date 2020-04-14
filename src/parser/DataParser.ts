import ParentParser from './ParentParser';
import { Tags } from './tags';
import { ExtendedData } from '../types/kml';
import ParserStream from '../stream/ParserStream';
import { ParserOptions } from './BaseParser';

export default class DataParser extends ParentParser<ExtendedData> {
    static Tag = Tags.Data;

    data: ExtendedData;

    constructor(stream: ParserStream, options?: ParserOptions) {
        super(stream, options);
        this.data = {
            name: options && options.attributes && options.attributes.name,
        };
    }

    openTag(name: string) {
        switch (name) {
            case Tags.Value:
                this.awaitText().then((value) => {
                    this.data.value = value;
                });
                break;
        }
    }
}
