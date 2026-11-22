var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var data = require('../fixtures/data');
var parser = require('../../index');

test('sb', function (t, done) {
    var set = data.sb;
    var remaining = set.length;
    var callback = function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        if (--remaining === 0) done();
    };
    for (var i in data.sb) {
        parser(data.sb[i], false, callback);
    }
});

test('sb2', function (t, done) {
    var set = data.sb2;
    var remaining = set.length;
    var callback = function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.info, 'object');
        assert.equal(possibleZip instanceof JSZip, true);
        if (--remaining === 0) done();
    };
    for (var i in data.sb2) {
        parser(data.sb2[i], false, callback);
    }
});

test('sb3', function (t, done) {
    var set = data.sb3;
    var remaining = set.length;
    var callback = function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.targets, 'object');
        assert.equal(possibleZip instanceof JSZip, true);
        if (--remaining === 0) done();
    };
    for (var i in data.sb3) {
        parser(data.sb3[i], false, callback);
    }
});

test('json', function (t, done) {
    var set = data.json;
    var remaining = set.length;
    var callback = function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.projectVersion, 'number');
        if (res.projectVersion === 2) {
            assert.equal(typeof res.info, 'object');
        } else if (res.projectVersion === 3) {
            assert.equal(typeof res.info, 'undefined');
        }
        assert.equal(possibleZip, null);
        if (--remaining === 0) done();
    };
    for (var i in data.json) {
        parser(data.json[i], false, callback);
    }
});

test('json string', function (t, done) {
    var set = data.json;
    var remaining = set.length;
    var callback = function (err, result) {
        assert.equal(err, null);
        assert.equal(Array.isArray(result), true);
        var res = result[0];
        var possibleZip = result[1];
        assert.equal(typeof res, 'object');
        assert.equal(typeof res.projectVersion, 'number');
        if (res.projectVersion === 2) {
            assert.equal(typeof res.info, 'object');
        } else if (res.projectVersion === 3) {
            assert.equal(typeof res.info, 'undefined');
        }
        assert.equal(possibleZip, null);
        if (--remaining === 0) done();
    };
    for (var i in data.json) {
        parser(data.json[i].toString('utf-8'), false, callback);
    }
});
