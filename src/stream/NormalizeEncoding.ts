import { Transform, TransformCallback } from 'stream';
import detectCharacterEncoding from 'detect-character-encoding';

const DETECTED_ENCODINGS = {
    UTF16LE: 'UTF-16LE',
};

const UTF16LE = 'utf16le';
const UTF8 = 'utf8';

class NormalizeEncoding extends Transform {
    encoding: string;

    getKnownEncoding(encoding: string) {
        switch (encoding) {
            case DETECTED_ENCODINGS.UTF16LE:
                return UTF16LE;
            default:
                return UTF8;
        }
    }

    _transform(chunk: Buffer, encoding: string, callback: TransformCallback) {
        if (!this.encoding) {
            const characterSet = detectCharacterEncoding(chunk);
            if (characterSet) {
                this.encoding = this.getKnownEncoding(characterSet.encoding);
            }
        }
        callback(null, chunk.toString(this.encoding));
    }
}

export default NormalizeEncoding;
