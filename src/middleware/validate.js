const Ajv = require('ajv');
const addFormats = require('ajv-formats');

// vytvoríme jednu inštanciu AJV pre celú aplikáciu
const ajv = new Ajv({ allErrors: true });
addFormats(ajv); // pridá podporu pre formáty ako 'date', 'email', atď.

// validuje req.body podľa zadanej schémy
function validateBody(schema) {
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        const valid = validate(req.body);

        if (!valid) {
            return res.status(400).json(formatErrors(validate.errors));
        }

        next();
    };
}

// validuje req.query podľa zadanej schémy
function validateQuery(schema) {
    const validate = ajv.compile(schema);

    return (req, res, next) => {
        const valid = validate(req.query);

        if (!valid) {
            return res.status(400).json(formatErrors(validate.errors));
        }

        next();
    };
}

// preformátuje AJV chyby do nášho štandardného formátu
function formatErrors(errors) {
    const missingKeyMap = {};
    const invalidTypeKeyMap = {};
    const invalidValueKeyMap = {};

    for (const err of errors) {
        // chýbajúce povinné pole: "must have required property 'name'"
        if (err.keyword === 'required') {
            const key = err.params.missingProperty;
            missingKeyMap[key] = err.message;
        }
        // zlý typ: "must be string"
        else if (err.keyword === 'type') {
            const key = err.instancePath.replace('/', '') || err.params.type;
            invalidTypeKeyMap[key] = err.message;
        }
        // zlá hodnota: enum, minimum, maxLength...
        else {
            const key = err.instancePath.replace('/', '') || err.schemaPath;
            invalidValueKeyMap[key] = err.message;
        }
    }

    return {
        error: 'invalidDtoIn',
        message: 'DtoIn is not valid.',
        details: { missingKeyMap, invalidTypeKeyMap, invalidValueKeyMap }
    };
}

module.exports = { validateBody, validateQuery };
