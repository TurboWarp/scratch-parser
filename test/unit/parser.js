var fs = require('fs');
var path = require('path');
var test = require('node:test');
var assert = require('node:assert/strict');
var parse = require('../../lib/parse');
var data = require('../fixtures/data');

test('spec', function (t, done) {
    assert.equal(typeof parse, 'function');
    done();
});

test('valid', function (t, done) {
    for (var i = 0; i < data.json.length; i++) {
        parse(data.json[i].toString(), function (err, res) {
            assert.equal(err, null);
            assert.equal(typeof res, 'object');
        });
    }
    done();
});

test('invalid', function (t, done) {
    parse('&%@', function (err, res) {
        assert.equal(typeof err, 'string');
        assert.equal(typeof res, 'undefined');
        done();
    });
});

test('backspace control characters get stripped out in sb2', function (t, done) {
    var backspaceControlSb2 = fs.readFileSync(
        path.resolve(__dirname, '../fixtures/data/217845144_sb2_control_char_in_strings_credit_to_Mr-Dave_test.json'));
    parse(backspaceControlSb2.toString(), function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');

        // Verify that the object doesn't have a control character in the global variable name
        assert.equal(Array.isArray(res.variables), true);
        assert.equal(res.variables.length, 1);
        // The parsed string should no longer include a backspace control character
        assert.equal(res.variables[0].name, 'b-damage');
        done();
    });
});

test('backspace control characters get stripped out in sb3', function (t, done) {
    var backspaceControlSb2 = fs.readFileSync(
        path.resolve(__dirname, '../fixtures/data/217845144_sb3_control_char_in_strings_credit_to_Mr-Dave_test.json'));
    parse(backspaceControlSb2.toString(), function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');

        // Verify that the object doesn't have a control character in the global variable name
        assert.equal(Array.isArray(res.targets), true);
        assert.equal(res.targets.length, 2);
        assert.equal(typeof res.targets[0].variables, 'object');
        var backspaceControlVariableId = Object.keys(res.targets[0].variables)[0];
        var backspaceControlVariable = res.targets[0].variables[backspaceControlVariableId];
        // The parsed string should no longer include a backspace control character
        assert.equal(backspaceControlVariable[0], 'b-damage');
        done();
    });
});

test('backslashes are kept when stripping backspace control characters', function (t, done) {
    var json = JSON.stringify({
        test: '\\\\\baaa\ba'
    });
    parse(json, function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');
        assert.equal(res.test, '\\\\aaaa');
        done();
    });
});

test('backslashes followed by b are not stripped at all', function (t, done) {
    var json = JSON.stringify({
        test: '\\b\b\\\\b'
    });
    parse(json, function (err, res) {
        assert.equal(err, null);
        assert.equal(typeof res, 'object');
        assert.equal(res.test, '\\b\\\\b');
        done();
    });
});

test('supports non-standard Scratch 2 JSON', (t, done) => {
    const json = `
    {
        // This is a line comment
        /* This is
                    a block comment */
        "something": [
            Infinity,
            -Infinity,
            // Trailing comma should be ignored
            NaN,
        ]
    }
    This is some extra garbage at the end that should be ignored.
    `;
    parse(json, (err, res) => {
        assert.equal(err, null);
        assert.deepEqual(res, {
            something: [
                Infinity,
                -Infinity,
                NaN
            ]
        });
        done();
    });
});
