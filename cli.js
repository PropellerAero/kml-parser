const fs = require('fs');
const path = require('path');
require('regenerator-runtime');
const KmlParser = require('./dist/parser/KmlParser').default;

const filePath = path.resolve(process.argv[2]);

const stream = fs.createReadStream(filePath);

const kmlParser = new KmlParser(stream);

kmlParser.parse().then((design) => {
    fs.writeFileSync(
        path.join(__dirname, './output.json'),
        JSON.stringify(design)
    );
});
