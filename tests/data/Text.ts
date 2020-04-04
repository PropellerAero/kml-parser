export default {
    blocks: {},
    entities: [
        {
            color: 16711680,
            text: 'Text 1',
            extendedData: {
                customStrings: ['Text 1'],
            },
            handle: '10',
            layer: 'My Texts',
            type: 'TEXT',
            position: {
                x: 150,
                y: 30,
                z: 0,
            },
        },
        {
            color: 16711680,
            extendedData: {
                customStrings: ['Text 1'],
            },
            handle: '11',
            layer: 'My Texts',
            type: 'POINT',
            position: {
                x: 150,
                y: 30,
                z: 0,
            },
        },
    ],
    header: [],
    tables: {
        layer: {
            handle: '2',
            layers: {
                'My Texts': {
                    name: 'My Texts',
                },
            },
            ownerHandle: '0',
        },
    },
};
