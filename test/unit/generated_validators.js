const fs = require('fs');
const path = require('path');
const {test} = require('node:test');
const assert = require('node:assert/strict');
const builder = require('../../scripts/build-validators');

test('generated validators are up to date (run: npm run build:validators)', () => {
    for (const [fileName, contents] of Object.entries(builder.generate())) {
        const existing = fs.readFileSync(path.join(builder.OUTPUT_DIRECTORY, fileName), 'utf8');
        assert.equal(existing, contents, fileName);
    }
});

const findJSONFixtures = directory => fs.readdirSync(directory, {withFileTypes: true}).flatMap(entry => {
    const file = path.join(directory, entry.name);
    if (entry.isDirectory()) {
        return findJSONFixtures(file);
    }
    try {
        const parsed = JSON.parse(fs.readFileSync(file, 'utf8'));
        return parsed && typeof parsed === 'object' ? [parsed] : [];
    } catch (e) {
        // Not JSON
        return [];
    }
});

test('generated validators behave the same as ajv', () => {
    const ajv = builder.createAjv();
    const pairs = {};
    for (const [fileName, schemas] of Object.entries(builder.FILES)) {
        // eslint-disable-next-line global-require
        const generated = require(path.join(builder.OUTPUT_DIRECTORY, fileName));
        for (const [exportName, schema] of Object.entries(schemas)) {
            pairs[`${fileName} ${exportName}`] = [ajv.getSchema(schema.$id), generated[exportName]];
        }
    }
    assert.equal(Object.keys(pairs).length, 4);

    const inputs = [];
    for (const input of findJSONFixtures(path.join(__dirname, '..', 'fixtures', 'data'))) {
        inputs.push(input);

        // Also exercise some error paths
        if (Array.isArray(input.targets) && input.targets.length > 0) {
            const noCostumes = structuredClone(input);
            noCostumes.targets[0].costumes = [];
            inputs.push(noCostumes);

            const badStage = structuredClone(input);
            badStage.targets[0].name = 5;
            inputs.push(badStage);
        }
        if (Array.isArray(input.children)) {
            const badChildren = structuredClone(input);
            badChildren.children = 5;
            inputs.push(badChildren);
        }
        if ('objName' in input) {
            const badName = structuredClone(input);
            badName.objName = 5;
            inputs.push(badName);
        }
    }
    assert.ok(inputs.length > 20, 'found fixtures');

    inputs.forEach((input, index) => {
        for (const [type, [live, generated]] of Object.entries(pairs)) {
            assert.equal(generated(input), live(input), `${type} result ${index}`);
            assert.deepEqual(generated.errors, live.errors, `${type} errors ${index}`);
        }
    });
});
