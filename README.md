# kml-parser

**DEPRECATION NOTICE:** This codebase has been incorporated into https://github.com/PropellerAero/design-io

Stream based KML Parser which converts KML to a proprietary Propeller Design JSON format.

### Usage

#### In Code

```javascript
import kmlParser from '@propelleraero/kml-parser';

const stream = fs.createReadStream('my.kml');
const kmlParser = new KmlParser(stream);
const design = kmlParser.parse();
```

#### As CLI

```
$ yarn cli tests/data/Point.kml
```
