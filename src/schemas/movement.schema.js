// schéma pre vytvorenie pohybu (POST /api/movements)
const createMovementSchema = {
    type: 'object',
    required: ['productId', 'type', 'quantity'],
    additionalProperties: false,
    properties: {
        productId: { type: 'integer', minimum: 1 },
        type:      { type: 'string', enum: ['prijem', 'vydaj'] },
        quantity:  { type: 'number', exclusiveMinimum: 0 },
        note:      { type: 'string', maxLength: 1000 }
    }
};

// schéma pre úpravu pohybu (PUT /api/movements/:id)
// meniť sa smie iba note
const updateMovementSchema = {
    type: 'object',
    required: [],
    additionalProperties: false,
    properties: {
        note: { type: 'string', maxLength: 1000 }
    }
};

// schéma pre query parametre listMovements (GET /api/movements?productId=1&type=prijem...)
const listMovementsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        productId:   { type: 'string', pattern: '^[0-9]+$' },
        productName: { type: 'string' },
        type:        { type: 'string', enum: ['prijem', 'vydaj'] },
        dateFrom:  { type: 'string', format: 'date' },
        dateTo:    { type: 'string', format: 'date' },
        sort:      { type: 'string', enum: ['newest', 'oldest'] },
        page:      { type: 'string', pattern: '^[0-9]+$' },
        limit:     { type: 'string', pattern: '^[0-9]+$' }
    }
};

module.exports = { createMovementSchema, updateMovementSchema, listMovementsSchema };
