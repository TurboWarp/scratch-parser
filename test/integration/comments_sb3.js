var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var data = require('../fixtures/data');
var parser = require('../../index');

test('comments sb3', function (t, done) {
    parser(data.sb3_comments.comments, false, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 3);
        assert.equal(possibleZip instanceof JSZip, true);

        assert.equal(typeof res.targets[0].comments, 'object');
        assert.equal(Object.values(res.targets[0].comments).length, 1);

        assert.equal(typeof res.targets[1].comments, 'object');
        assert.equal(Object.values(res.targets[1].comments).length, 6);

        done();
    });
});

test('invalid comments sb3', function (t, done) {
    parser(data.sb3_comments.invalid_comments, false, function (err, result) {
        assert.equal(typeof err, 'object');
        assert.equal(typeof err.validationError, 'string');

        var sb3Errors = err.sb3Errors;
        assert.equal(typeof sb3Errors, 'object');
        assert.equal(typeof sb3Errors[0].keyword, 'string');
        assert.equal(typeof sb3Errors[0].instancePath, 'string');
        assert.match(sb3Errors[0].instancePath, /^\.targets\[1\]\.comments\[.*\]\.width$/);
        assert.equal(typeof sb3Errors[0].schemaPath, 'string');
        assert.equal(typeof sb3Errors[0].message, 'string');
        assert.equal(sb3Errors[0].message, 'must be number');
        assert.equal(typeof sb3Errors[0].params, 'object');
        assert.equal(typeof result, 'undefined');

        done();
    });
});
