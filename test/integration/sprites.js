var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var data = require('../fixtures/data');
var parser = require('../../index');

test('default cat sprite2', function (t, done) {
    parser(data.sprites.default_cat_sprite2, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip instanceof JSZip, true);
        done();
    });
});

test('example sprite2', function (t, done) {
    parser(data.sprites.example_sprite2, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip instanceof JSZip, true);
        done();
    });
});

test('banana sprite2, no sounds', function (t, done) {
    parser(data.sprites.bananas_sprite2, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip instanceof JSZip, true);
        done();
    });
});

test('nested banana sprite2', function (t, done) {
    parser(data.sprites.bananas_nested_sprite2, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip instanceof JSZip, true);
        done();
    });
});

test('default cat sprite2 json', function (t, done) {
    parser(data.sprites.default_cat_sprite2_json, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip, null);
        done();
    });
});

test('default cat sprite2 json', function (t, done) {
    parser(data.sprites.example_sprite2_json, true, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(res.projectVersion, 2);
        assert.equal(possibleZip, null);
        done();
    });
});
