var test = require('tap').test;
var data = require('../fixtures/data');
var validate = require('../../lib/validate');

test('spec', function (t) {
    t.type(validate, 'function');
    t.end();
});

test('valid sb2 project', function (t) {
    validate(false, JSON.parse(data.example.json), function (err, res) {
        t.equal(err, null);
        t.type(res, 'object');
        t.end();
    });
});

test('valid sprite2', function (t) {
    validate(true, JSON.parse(data.sprites.default_cat_sprite2_json), function (err, res) {
        t.equal(err, null);
        t.type(res, 'object');
        t.end();
    });
});

// Note, the way the sb2/sprite2 validation is written, a valid sb2 project can actually
// validate as a sprite2 file. The opposite should not be true.

test('valid sprite2 is not a valid project', function (t) {
    validate(false, JSON.parse(data.sprites.default_cat_sprite2_json), function (err, res) {
        t.type(err, 'object');
        t.type(err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        t.equal(Array.isArray(sb2Errs), true);
        t.type(res, 'undefined');
        t.end();
    });
});

test('invalid, whole project', function (t) {
    validate(false, {foo: 1}, function (err, res) {
        t.type(err, 'object');
        t.type(err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        t.equal(Array.isArray(sb2Errs), true);
        t.type(res, 'undefined');
        t.type(sb2Errs[0], 'object');
        t.type(sb2Errs[0].keyword, 'string');
        t.type(sb2Errs[0].dataPath, 'string');
        t.type(sb2Errs[0].schemaPath, 'string');
        t.type(sb2Errs[0].message, 'string');
        t.type(sb2Errs[0].params, 'object');
        t.type(sb2Errs[0].params.missingProperty, 'string');
        t.end();
    });
});

test('invalid, sprite', function (t) {
    validate(true, {foo: 1}, function (err, res) {
        t.type(err, 'object');
        t.type(err.validationError, 'string');
        var sb2Errs = err.sb2Errors;
        t.equal(Array.isArray(sb2Errs), true);
        t.type(res, 'undefined');
        t.type(sb2Errs[0], 'object');
        t.type(sb2Errs[0].keyword, 'string');
        t.type(sb2Errs[0].dataPath, 'string');
        t.type(sb2Errs[0].schemaPath, 'string');
        t.type(sb2Errs[0].message, 'string');
        t.type(sb2Errs[0].params, 'object');
        t.type(sb2Errs[0].params.missingProperty, 'string');
        t.end();
    });
});

// Test layer order rules
test('sb3 json with valid layerOrder props for stage and sprites', function (t) {
    validate(false, JSON.parse(data.layerOrderSB3Json), function (err, res) {
        t.equal(err, null);
        t.type(res, 'object');
        t.end();
    });
});

test('sb3 json with invalid layerOrder prop for stage', function (t) {
    validate(false, JSON.parse(data.invalidStageLayerSB3Json), function (err, res) {
        t.type(err, 'object');
        t.type(res, 'undefined');
        t.end();
    });
});

test('sb3 json with invalid layerOrder prop for sprite', function (t) {
    validate(false, JSON.parse(data.invalidSpriteLayerSB3Json), function (err, res) {
        t.type(err, 'object');
        t.type(res, 'undefined');
        t.end();
    });
});

// Sprites should not be named _stage_
test('sb3 json with invalid sprite name', function (t) {
    validate(false, JSON.parse(data.invalidSpriteNameSB3Json), function (err, res) {
        t.type(err, 'object');
        t.type(res, 'undefined');
        t.end();
    });
});

test('sb3 errors listed before sb2 errors', function (t) {
    validate(false, {'this object is': 'invalid'}, function (err) {
        const keys = Object.keys(err);
        const sb2Index = keys.indexOf('sb2Errors');
        const sb3Index = keys.indexOf('sb3Errors');
        t.not(sb2Index, -1);
        t.not(sb3Index, -1);
        t.ok(sb3Index < sb2Index);
        t.end();
    });
});

test('Uses sb3fix if validation fails', function (t) {
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
        t.equal(err, null);
        t.equal(res.costumes.length, 1); // sb3fix will add a costume
        t.end();
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

test('sb3 inputs and top level primitives', function (t) {
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
        t.equal(err, null);
        t.equal(res.projectVersion, 3);
        t.end();
    });
});

test('sb3 duplicate costumes are rejected', function (t) {
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
        t.type(err, 'object');
        t.equal(err.sb3Errors[0].message, 'Duplicate costumes or sounds');
        t.end();
    });
});

test('sb3 costumes that differ only by name are allowed', function (t) {
    var a = {assetId: '1'.repeat(32), dataFormat: 'png', name: 'a'};
    var b = {assetId: '1'.repeat(32), dataFormat: 'png', name: 'b'};
    validate(true, makeSprite3({}, [a, b]), function (err, res) {
        t.equal(err, null);
        t.equal(res.costumes.length, 2);
        t.end();
    });
});
