const hexToLong = (hex: string) => {
    const match = hex.match(
        /([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})/i
    );

    if (!match) {
        return 0xffffff;
    }

    const [, a, b, g, r] = match;

    const red = parseInt(r, 16) << 16;
    const green = parseInt(g, 16) << 8;
    const blue = parseInt(b, 16);
    return red + green + blue;
};

export default hexToLong;
