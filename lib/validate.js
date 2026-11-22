/**
 * Deep equality for parsed JSON values. NaN is not equal to itself. Keys such as "constructor" or
 * "toString" are compared like any other property.
 * @param {*} a First value
 * @param {*} b Second value
 * @return {boolean} True if the values are deeply equal
 */
const deepEqual = (a, b) => {
    if (a === b) {
        return true;
    }
    const isArrayA = Array.isArray(a);
    if (isArrayA !== Array.isArray(b)) {
        return false;
    }
    if (isArrayA) {
        return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]));
    }
    if (a instanceof Object && b instanceof Object) {
        const keys = Object.keys(a);
        return keys.length === Object.keys(b).length && keys.every(key => (
            Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key])
        ));
    }
    return false;
};

// Validators are precompiled by scripts/build-validators.js so that we don't need to load ajv
// or compile schemas at runtime. sb2 validators are loaded lazily as most projects won't need them.

/* eslint-disable global-require */

/**
 * @param {boolean} isSprite Whether to get the sprite3 validator instead of the sb3 validator
 * @return {function} ajv validate function
 */
const getSb3Validator = isSprite => {
    const validators = require('./generated/sb3_validators.js');
    return isSprite ? validators.sprite : validators.project;
};

/**
 * @param {boolean} isSprite Whether to get the sprite2 validator instead of the sb2 validator
 * @return {function} ajv validate function
 */
const getSb2Validator = isSprite => {
    const validators = require('./generated/sb2_validators.js');
    return isSprite ? validators.sprite : validators.project;
};

/* eslint-enable global-require */

/**
 * Linear-time duplicate asset check.
 * For background, ajv's `uniqueItems: true` is O(n^2) with respect to the number of items in the list.
 * For projects that had thousands of costumes in a single sprite, that was millions of uniqueness checks
 * for no reason.
 * @param {Array} items Costumes or sounds
 * @return {boolean} True if any two items are identical
 */
const hasDuplicate = items => {
    const groups = Object.create(null);
    for (const item of items) {
        const key = `${item.assetId}/${item.name}`;
        const group = groups[key];
        if (!group) {
            groups[key] = [item];
        } else if (group.some(other => deepEqual(item, other))) {
            return true;
        } else {
            group.push(item);
        }
    }
    return false;
};

/**
 * @param {boolean} isSprite Whether input is a single sprite
 * @param {object} input Already validated sb3 project or sprite
 * @return {boolean} True if any target has identical costumes or sounds
 */
const hasDuplicateAssets = (isSprite, input) => {
    const targets = isSprite ? [input] : input.targets;
    return targets.some(target => hasDuplicate(target.costumes) || hasDuplicate(target.sounds));
};

var validate = function (isSprite, input, callback) {
    var validateSb3 = getSb3Validator(isSprite);
    var isValidSb3 = validateSb3(input);
    var sb3Errors = validateSb3.errors;
    if (isValidSb3 && hasDuplicateAssets(isSprite, input)) {
        isValidSb3 = false;
        sb3Errors = [{message: 'Duplicate costumes or sounds'}];
    }
    if (isValidSb3) {
        input.projectVersion = 3;
        return callback(null, input);
    }

    var validateSb2 = getSb2Validator(isSprite);
    var isValidSb2 = validateSb2(input);
    if (isValidSb2) {
        input.projectVersion = 2;
        return callback(null, input);
    }

    var validationErrors = {
        validationError: 'Could not parse as a valid SB2 or SB3 project.',
        sb3Errors: sb3Errors,
        sb2Errors: validateSb2.errors
    };

    callback(validationErrors);
};

module.exports = function (isSprite, input, callback) {
    // If validate fails, try using sb3fix to salvage the input
    validate(isSprite, input, function (err, result) {
        if (!err) {
            callback(null, result);
            return;
        }

        try {
            // Load slightly lazily as this is an edge case
            // eslint-disable-next-line global-require
            var sb3fix = require('@turbowarp/sb3fix');

            var fixed = sb3fix.fixJSON(input, {
                platform: 'turbowarp'
            });
            validate(isSprite, fixed, function (err2, result2) {
                if (err2) {
                    // Original validation error will be most useful
                    callback(err);
                } else {
                    callback(null, result2);
                }
            });
        } catch (sb3fixError) {
            // The original validation error will be most useful
            callback(err);
        }
    });
};
