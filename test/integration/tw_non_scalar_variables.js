const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const parser = require('../../index');

test('non scalar variables', function (t, done) {
    const fixture = fs.readFileSync(path.join(__dirname, '../fixtures/tw_non_scalar_variables.json'), 'utf-8');
    parser(fixture, false, function (err, result) {
        assert.equal(err, null);
        assert.deepEqual(result[0].targets[0].variables['8Ct!xBe$u3!.nz_Bh/]#'][1], {
            hello: 'world'
        });
        assert.deepEqual(result[0].targets[0].lists['u(}PhnFj*Oe*`Ka~{hhc'][1], [
            {
                a: 1
            },
            {
                b: 2
            }
        ]);
        done();
    });
});
