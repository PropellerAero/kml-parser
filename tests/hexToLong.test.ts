import hexToLong from '../src/utils/hexToLong';

describe('hexToLong', () => {
    it('should parse hex to number', () => {
        expect(hexToLong('ffffffff')).toEqual(0xffffff);
    });
    it('should be case insensitive', () => {
        expect(hexToLong('FF00DDFF')).toEqual(0xffdd00);
    });
    it('should ignore alpha', () => {
        expect(hexToLong('ff0000ff')).toEqual(0xff0000);
    });
    it('should default to white', () => {
        expect(hexToLong('amethyst')).toEqual(0xffffff);
    });
});
