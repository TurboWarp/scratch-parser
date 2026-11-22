var test = require('node:test');
var assert = require('node:assert/strict');
var data = require('../fixtures/data');
var validate = require('../../lib/validate');

test('spec', function (t, done) {
    assert.equal(typeof validate, 'function');
    done();
});

test('valid sb2 project', function (t, done) {
    validate(false, JSON.parse(data.example.json), function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');
        done();
    });
});

test('valid sprite2', function (t, done) {
    validate(true, JSON.parse(data.sprites.default_cat_sprite2_json), function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');
        done();
    });
});

// Note, the way the sb2/sprite2 validation is written, a valid sb2 project can actually
// validate as a sprite2 file. The opposite should not be true.

test('valid sprite2 is not a valid project', function (t, done) {
    validate(false, JSON.parse(data.sprites.default_cat_sprite2_json), function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        assert.equal(Array.isArray(sb2Errs), true);
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('invalid, whole project', function (t, done) {
    validate(false, {foo: 1}, function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        assert.equal(Array.isArray(sb2Errs), true);
        assert.equal(typeof res, 'undefined');
        assert.equal(typeof sb2Errs[0], 'object');
        assert.equal(typeof sb2Errs[0].keyword, 'string');
        assert.equal(typeof sb2Errs[0].instancePath, 'string');
        assert.equal(typeof sb2Errs[0].schemaPath, 'string');
        assert.equal(typeof sb2Errs[0].message, 'string');
        assert.equal(typeof sb2Errs[0].params, 'object');
        assert.equal(typeof sb2Errs[0].params.missingProperty, 'string');
        done();
    });
});

test('invalid, sprite', function (t, done) {
    validate(true, {foo: 1}, function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        assert.equal(Array.isArray(sb2Errs), true);
        assert.equal(typeof res, 'undefined');
        assert.equal(typeof sb2Errs[0], 'object');
        assert.equal(typeof sb2Errs[0].keyword, 'string');
        assert.equal(typeof sb2Errs[0].instancePath, 'string');
        assert.equal(typeof sb2Errs[0].schemaPath, 'string');
        assert.equal(typeof sb2Errs[0].message, 'string');
        assert.equal(typeof sb2Errs[0].params, 'object');
        assert.equal(typeof sb2Errs[0].params.missingProperty, 'string');
        done();
    });
});

// Test layer order rules
test('sb3 json with valid layerOrder props for stage and sprites', function (t, done) {
    validate(false, JSON.parse(data.layerOrderSB3Json), function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');
        done();
    });
});

test('sb3 json with invalid layerOrder prop for stage', function (t, done) {
    validate(false, JSON.parse(data.invalidStageLayerSB3Json), function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb3 json with invalid layerOrder prop for sprite', function (t, done) {
    validate(false, JSON.parse(data.invalidSpriteLayerSB3Json), function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

// Sprites should not be named _stage_
test('sb3 json with invalid sprite name', function (t, done) {
    validate(false, JSON.parse(data.invalidSpriteNameSB3Json), function (err, res) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb3 errors listed before sb2 errors', function (t, done) {
    validate(false, {'this object is': 'invalid'}, function (err) {
        const keys = Object.keys(err);
        const sb2Index = keys.indexOf('sb2Errors');
        const sb3Index = keys.indexOf('sb3Errors');
        assert.notEqual(sb2Index, -1);
        assert.notEqual(sb3Index, -1);
        assert.ok(sb3Index < sb2Index);
        done();
    });
});

test('Uses sb3fix if validation fails', function (t, done) {
    var invalidSprite = {
        isStage: false,
        name: 'Sprite1',
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: {},
        comments: {},
        currentCostume: 0,
        costumes: [], // should not be empty!
        sounds: [],
        volume: 100,
        visible: true,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around'
    };
    validate(true, invalidSprite, function (err, res) {
        assert.equal(err, null);
        assert.equal(res.costumes.length, 1); // sb3fix will add a costume
        done();
    });
});

var makeSprite3 = function (blocks, costumes) {
    return {
        isStage: false,
        name: 'Sprite1',
        variables: {},
        lists: {},
        broadcasts: {},
        blocks: blocks,
        comments: {},
        currentCostume: 0,
        costumes: costumes || [{
            assetId: '1'.repeat(32),
            dataFormat: 'png',
            name: 'costume1',
            md5ext: '1'.repeat(32) + '.png'
        }],
        sounds: [],
        volume: 100,
        visible: true,
        x: 0,
        y: 0,
        size: 100,
        direction: 90,
        draggable: false,
        rotationStyle: 'all around'
    };
};

test('sb3 inputs and top level primitives', function (t, done) {
    var sprite = makeSprite3({
        a: {
            opcode: 'motion_movesteps',
            next: null,
            parent: null,
            inputs: {
                NUM: [1, [4, '10']],
                COLOR: [1, [9, '#ff00ff']],
                TEXT: [3, 'b', [10, 'hello']],
                BROADCAST: [1, [11, 'message1', 'id']],
                VAR: [3, [12, 'my variable', 'id'], [10, '']],
                LIST: [3, [13, 'my list', 'id'], [10, '']],
                EMPTY: [1, null]
            },
            fields: {},
            shadow: false,
            topLevel: true,
            x: 0,
            y: 0
        },
        b: [12, 'my variable', 'id', 10, 20],
        c: [13, 'my list', 'id', 10, 20]
    });
    validate(true, sprite, function (err, res) {
        assert.equal(err, null);
        assert.equal(res.projectVersion, 3);
        done();
    });
});

test('sb3 duplicate costumes are rejected', function (t, done) {
    var costume = {
        assetId: '1'.repeat(32),
        dataFormat: 'png',
        name: 'costume1',
        md5ext: '1'.repeat(32) + '.png'
    };
    // Same costume with properties in a different order
    var reordered = {
        md5ext: '1'.repeat(32) + '.png',
        name: 'costume1',
        dataFormat: 'png',
        assetId: '1'.repeat(32)
    };
    validate(true, makeSprite3({}, [costume, reordered]), function (err) {
        assert.equal(typeof err, 'object');
        assert.equal(err.sb3Errors[0].message, 'Duplicate costumes or sounds');
        done();
    });
});

test('sb3 costumes that differ only by name are allowed', function (t, done) {
    var a = {assetId: '1'.repeat(32), dataFormat: 'png', name: 'a'};
    var b = {assetId: '1'.repeat(32), dataFormat: 'png', name: 'b'};
    validate(true, makeSprite3({}, [a, b]), function (err, res) {
        assert.equal(err, null);
        assert.equal(res.costumes.length, 2);
        done();
    });
});

test('NaN and Infinity are allowed as numbers', function (t, done) {
    var sprite2 = JSON.parse('{"objName":"Sprite1","costumes":[],"currentCostumeIndex":0,"scratchX":1e400}');
    assert.equal(sprite2.scratchX, Infinity);
    validate(true, sprite2, function (err, res) {
        assert.equal(err, null);
        assert.equal(res.projectVersion, 2);

        var sprite3 = makeSprite3({});
        sprite3.x = Infinity;
        sprite3.y = -Infinity;
        sprite3.direction = NaN;
        validate(true, sprite3, function (err2, res2) {
            assert.equal(err2, null);
            assert.equal(res2.projectVersion, 3);
            done();
        });
    });
});

test('sb3 duplicate check compares special keys as properties and NaN as unequal', function (t, done) {
    var assetId = 'a'.repeat(32);
    var costume = function (extra) {
        return Object.assign({assetId: assetId, name: 'c1', dataFormat: 'svg', md5ext: assetId + '.svg'}, extra);
    };
    var cases = [
        // Not functions, so they must not be called
        {costumes: [costume({toString: 1}), costume({toString: 2})], valid: true},
        {costumes: [costume({valueOf: {}}), costume({valueOf: []})], valid: true},
        // Just a regular property
        {costumes: [costume({constructor: {a: 1}}), costume({constructor: {a: 1}})], valid: false},
        // NaN is not equal to itself
        {costumes: [costume({rotationCenterX: NaN}), costume({rotationCenterX: NaN})], valid: true}
    ];
    var next = function (i) {
        if (i === cases.length) {
            done();
            return;
        }
        validate(true, makeSprite3({}, cases[i].costumes), function (err) {
            assert.equal(err === null, cases[i].valid, 'case ' + i);
            next(i + 1);
        });
    };
    next(0);
});
