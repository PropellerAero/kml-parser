export type Cartesian3 = {
    x: number;
    y: number;
    z: number;
};

export interface BaseEntity {
    handle: string;
    ownerHandle?: string;
    type: string;
    extendedData?: {
        customStrings: Array<string>;
    };
    layer: string;
    name?: string;
}

export interface Polyline extends BaseEntity {
    type: 'POLYLINE';
    color: number;
    vertices: Array<Cartesian3>;
}

export interface Point extends BaseEntity {
    type: 'POINT';
    color: number;
    position: Cartesian3;
}

export interface Text extends BaseEntity {
    type: 'TEXT';
    color: number;
    position: Cartesian3;
    text: string;
}

export type Entity = Polyline | Point | Text;

export type Block = {
    position: Cartesian3;
    entities: Array<Entity>;
};

export type BlockMap = {
    [name: string]: Block;
};

export type Layer = {
    name: string;
    color?: number;
};

export type LayerTable = {
    [id: string]: Layer;
};

export type Design = {
    entities: Array<Entity>;
    header: Array<any>;
    tables: {
        layer: {
            handle?: string;
            ownerHandle?: string;
            layers: LayerTable;
        };
    };
    blocks: BlockMap;
};
