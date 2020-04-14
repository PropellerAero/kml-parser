declare module 'detect-character-encoding' {
    export type CharacterSet = {
        encoding: string;
        confidence: number;
    };
    export default function (buffer: Buffer): CharacterSet | null;
}
