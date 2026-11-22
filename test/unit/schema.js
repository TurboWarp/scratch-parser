const {test} = require('tap');
const Ajv = require('ajv').default;
const builder = require('../../scripts/build-validators');
const sb2Definitions = require('../../lib/sb2_definitions.json');
const sb3Definitions = require('../../lib/sb3_definitions.json');

test('all schemas are valid draft-07 schemas', t => {
    const ajv = new Ajv();
    const schemas = [
        sb2Definitions,
        sb3Definitions,
        ...Object.values(builder.FILES).flatMap(file => Object.values(file))
    ];
    t.equal(schemas.length, 6);
    for (const schema of schemas) {
        t.equal(ajv.validateSchema(schema), true, schema.$id);
        t.same(ajv.errors, null, schema.$id);
    }
    t.end();
});
