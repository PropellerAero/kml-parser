export default {
    blocks: {},
    entities: [
        {
            color: 16777215,
            extendedData: {
                customStrings: ['Point 1'],
            },
            handle: '10',
            layer: 'My Point 1',
            type: 'POINT',
            position: {
                x: 150,
                y: 30,
                z: 0,
            },
        },
        {
            color: 16777215,
            extendedData: {
                customStrings: ['Point 2'],
            },
            handle: '11',
            layer: 'My Point 2',
            type: 'POINT',
            position: {
                x: 120,
                y: 10,
                z: 0,
            },
        },
    ],
    header: [],
    tables: {
        layer: {
            handle: '2',
            layers: {
                'My Point 1': {
                    name: 'My Point 1',
                },
                'My Point 2': {
                    name: 'My Point 2',
                },
            },
            ownerHandle: '0',
        },
    },
};
