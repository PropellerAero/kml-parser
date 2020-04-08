import ParentParser from './ParentParser';
import { Tags } from './tags';
import DataParser from './DataParser';
import { ExtendedData } from '../types/kml';
import { Attributes } from '../types/node-xml-stream';

export default class ExtendedDataParser extends ParentParser<
    Array<ExtendedData>
> {
    static Tag = Tags.ExtendedData;

    data: Array<ExtendedData> = [];

    openTag(name: string, attributes: Attributes) {
        switch (name) {
            case Tags.Data:
                this.await(this.parseData(attributes));
                break;
        }
    }

    async parseData(attributes: Attributes) {
        const dataParser = new DataParser(this.stream, {
            ...this.options,
            attributes,
        });
        const extendedData = await dataParser.parse();
        this.data.push(extendedData);
    }
}
