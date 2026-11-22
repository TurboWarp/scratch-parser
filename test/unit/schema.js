const {test} = require('node:test');
const assert = require('node:assert/strict');
const Ajv = require('ajv').default;
const builder = require('../../scripts/build-validators');
const sb2Definitions = require('../../lib/sb2_definitions.json');
const sb3Definitions = require('../../lib/sb3_definitions.json');

test('all schemas are valid draft-07 schemas', () => {
    const ajv = new Ajv();
    const schemas = [
        sb2Definitions,
        sb3Definitions,
        ...Object.values(builder.FILES).flatMap(file => Object.values(file))
    ];
    assert.equal(schemas.length, 6);
    for (const schema of schemas) {
        assert.equal(ajv.validateSchema(schema), true, schema.$id);
        assert.equal(ajv.errors, null, schema.$id);
    }
});
