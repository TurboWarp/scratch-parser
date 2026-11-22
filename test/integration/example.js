var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var data = require('../fixtures/data');
var parser = require('../../index');

test('sb', function (t, done) {
    parser(data.example.sb, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb2', function (t, done) {
    parser(data.example.sb2, false, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.info, 'object');
        assert.equal(possibleZip instanceof JSZip, true);
        done();
    });
});

test('json', function (t, done) {
    parser(data.example.json, false, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.info, 'object');
        assert.equal(possibleZip, null);
        done();
    });
});

test('json string', function (t, done) {
    parser(data.example.json.toString('utf-8'), false, function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.info, 'object');
        assert.equal(possibleZip, null);
        done();
    });
});

test('invalid empty project archive', function (t, done) {
    var msg = 'Failed to unzip and extract project.json, with error: ';
    parser(data.example.invalidEmpty, false, function (err, result) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(msg), true);
        assert.equal(typeof result, 'undefined');
        done();
    });
});
