var fs = require('fs');
var path = require('path');
var test = require('node:test');
var assert = require('node:assert/strict');
var JSZip = require('@turbowarp/jszip');
var unpack = require('../../lib/unpack');

var fixtures = {
    sb: path.resolve(__dirname, '../fixtures/data/_example.sb'),
    sb2: path.resolve(__dirname, '../fixtures/data/_example.sb2'),
    json: path.resolve(__dirname, '../fixtures/data/_example.json')
};

for (var i in fixtures) {
    fixtures[i] = fs.readFileSync(fixtures[i]);
}

test('spec', function (t, done) {
    assert.equal(typeof unpack, 'function');
    done();
});

test('sb', function (t, done) {
    var buffer = new Buffer(fixtures.sb);
    unpack(buffer, false, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('sb2', function (t, done) {
    var buffer = new Buffer(fixtures.sb2);
    unpack(buffer, false, function (err, res) {
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

test('sb2 does not validate as sprite', function (t, done) {
    var buffer = new Buffer(fixtures.sb2);
    unpack(buffer, true, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('json', function (t, done) {
    var buffer = new Buffer(fixtures.json);
    unpack(buffer, false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.doesNotThrow(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1], null);
        done();
    });
});

test('json utf-8 string', function (t, done) {
    var buffer = new Buffer(fixtures.json);
    unpack(buffer.toString('utf-8'), false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.doesNotThrow(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1], null);
        done();
    });
});

test('invalid string', function (t, done) {
    unpack('this is not json', false, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.throws(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1], null);
    });
    unpack('this is not json', true, function (err, res) {
        assert.equal(err, null);
        assert.equal(Array.isArray(res), true);
        assert.equal(typeof res[0], 'string');
        assert.throws(function () {
            JSON.parse(res[0]);
        });
        assert.equal(res[1], null);
        done();
    });
});

test('undefined', function (t, done) {
    var foo;
    unpack(false, foo, function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('null', function (t, done) {
    unpack(false, null, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof obj, 'undefined');
        done();
    });
});

test('object', function (t, done) {
    unpack(false, {}, function (err, obj) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof obj, 'undefined');
        done();
    });
});
