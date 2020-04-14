import { Transform, TransformCallback } from 'stream';
import { isEqual } from 'lodash';

const BYTEORDERMARKS = {
    UTF16LE: [0xff, 0xfe],
};

const UTF16LE = 'utf16le';
const UTF8 = 'utf8';

class NormalizeEncoding extends Transform {
    encoding: string;

    _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
        if (!this.encoding) {
            const byteOrderMarks = [chunk[0], chunk[1]];
            this.encoding = isEqual(BYTEORDERMARKS.UTF16LE, byteOrderMarks)
                ? UTF16LE
                : UTF8;
        }
        callback(null, chunk.toString(this.encoding));
    }
}

export default NormalizeEncoding;
