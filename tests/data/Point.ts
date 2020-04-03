export default {
    blocks: {},
    entities: [
        {
            color: 16777215,
            extendedData: {
                customStrings: ['Point 1'],
            },
            handle: '10',
            layer: 'My Points',
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
            layer: 'My Points',
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
                'My Points': {
                    name: 'My Points',
                },
            },
            ownerHandle: '0',
        },
    },
};
