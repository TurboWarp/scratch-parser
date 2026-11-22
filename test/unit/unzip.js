var fs = require('fs');
var path = require('path');
var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var unzip = require('../../lib/unzip');

var fixtures = {
    sb: path.resolve(__dirname, '../fixtures/data/_example.sb'),
    sb2: path.resolve(__dirname, '../fixtures/data/_example.sb2'),
    zipFakeProjectJSON:
        path.resolve(__dirname, '../fixtures/data/_zipFakeProjectJson.zip'),
    zipNoProjectJSON:
        path.resolve(__dirname, '../fixtures/data/_zipNoProjectJson.zip'),
    sb2Nested: path.resolve(__dirname, '../fixtures/data/_nestedFolder.sb2')
};

for (var i in fixtures) {
    fixtures[i] = fs.readFileSync(fixtures[i]);
}

var errorMessage = 'Failed to unzip and extract project.json';

test('spec', function (t, done) {
    assert.equal(typeof unzip, 'function');
    done();
});

test('sb', function (t, done) {
    var buffer = new Buffer(fixtures.sb);
    unzip(buffer, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb2', function (t, done) {
    var buffer = new Buffer(fixtures.sb2);
    unzip(buffer, false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.doesNotThrow(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1] instanceof JSZip, true);
        done();
    });
});

test('sb2 with nested folder', function (t, done) {
    var buffer = new Buffer(fixtures.sb2Nested);
    unzip(buffer, false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.doesNotThrow(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1] instanceof JSZip, true);
        done();
    });
});

test('zip without project json', function (t, done) {
    var buffer = new Buffer(fixtures.zipNoProjectJSON);
    unzip(buffer, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('zip with fake project json', function (t, done) {
    var buffer = new Buffer(fixtures.zipFakeProjectJSON);
    unzip(buffer, false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.equal(res[0], 'this is not json\n');
        assert.throws(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1] instanceof JSZip, true);
        done();
    });
});

var randomString = 'this is not a zip';

test('random string instead of zip, whole project', function (t, done) {
    unzip(randomString, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('random string instead of zip, sprite', function (t, done) {
    unzip(randomString, true, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('undefined', function (t, done) {
    var foo;
    unzip(foo, false, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof obj, 'undefined');
        done();
    });
});

test('null instead of zip, whole project', function (t, done) {
    unzip(null, false, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof obj, 'undefined');
        done();
    });
});

test('null instead of zip, sprite', function (t, done) {
    unzip(null, true, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof obj, 'undefined');
        done();
    });
});

test('object instead of zip, whole project', function (t, done) {
    unzip({}, false, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof obj, 'undefined');
        done();
    });
});

test('object instead of zip, sprite', function (t, done) {
    unzip({}, true, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(err.startsWith(errorMessage), true);
        assert.equal(typeof obj, 'undefined');
        done();
    });
});
