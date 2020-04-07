import fs from 'fs';
import path from 'path';
import Polyline from './data/Polyline';
import PolylineCoordinateConversion from './data/PolylineCoordinateConversion';
import KmlParser from '../src/parser/KmlParser';
import Point from './data/Point';
import Text from './data/Text';
import NestedFolders from './data/NestedFolders';
import StyleMap from './data/StyleMap';
import DefaultFolder from './data/DefaultFolder';

describe('KmlParser', () => {
    it('should parse a kml stream and return a design with polylines', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/Polyline.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(Polyline);
        done();
    });

    it('should accept a coordinate conversion function', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/Polyline.kml')
        );
        const parser = new KmlParser(stream, {
            convertCoordinate: ({ x, y, z }) => ({ x: x + 1, y: y + 1, z }),
        });
        const output = await parser.parse();
        expect(output).toEqual(PolylineCoordinateConversion);
        done();
    });

    it('should parse a kml stream and return a design object with points', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/Point.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(Point);
        done();
    });

    it('should parse a kml stream and return a design object with with cdata text', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/PointCDATA.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(Point);
        done();
    });

    it('should parse a kml stream and return a design object with texts', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/Text.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(Text);
        done();
    });

    it('should parse a kml stream and return a design object with nested folders', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/NestedFolders.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(NestedFolders);
        done();
    });

    it('should parse a kml stream and return a design object using style maps', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/StyleMap.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(StyleMap);
        done();
    });

    it('should parse a kml stream and return a design object using a folder style', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/FolderStyle.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(StyleMap);
        done();
    });

    it('should parse a kml stream and return a design object using a folder style', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/GlobalStyle.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(StyleMap);
        done();
    });

    it('should parse a kml stream and return a design object using a default folder', async (done) => {
        const stream = fs.createReadStream(
            path.join(__dirname, './data/DefaultFolder.kml')
        );
        const parser = new KmlParser(stream);
        const output = await parser.parse();
        expect(output).toEqual(DefaultFolder);
        done();
    });
});
