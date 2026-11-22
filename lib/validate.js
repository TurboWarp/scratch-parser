var ajv = require('ajv')();
var deepEqual = require('ajv/lib/compile/equal');
var sb2Defs = require('./sb2_definitions.json');
var sb3Defs = require('./sb3_definitions.json');
var sb2Schema = require('./sb2_schema.json');
var sb3Schema = require('./sb3_schema.json');
var sprite2Schema = require('./sprite2_schema.json');
var sprite3Schema = require('./sprite3_schema.json');
ajv.addSchema(sb2Defs).addSchema(sb3Defs);

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
    var validateSb3 = ajv.compile(isSprite ? sprite3Schema : sb3Schema);
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

    var validateSb2 = ajv.compile(isSprite ? sprite2Schema : sb2Schema);
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
