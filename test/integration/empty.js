var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var data = require('../fixtures/data');
var parser = require('../../index');

test('sb', function (t, done) {
    parser(data.empty.sb, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb2', function (t, done) {
    parser(data.empty.sb2, false, function (err, result) {
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
    parser(data.empty.json, false, function (err, result) {
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
    parser(data.empty.json.toString('utf-8'), false, function (err, result) {
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
