// zoznam povolených jednotiek — použijeme na viacerých miestach
const UNITS = ['ks', 'kg', 'g', 'm', 'cm', 'l', 'ml', 'balenie'];

// schéma pre vytvorenie produktu (POST /api/products)
const createProductSchema = {
    type: 'object',
    required: ['name', 'unit', 'minQuantity', 'maxQuantity'],
    additionalProperties: false,  // extra polia sú zakázané
    properties: {
        name:        { type: 'string', minLength: 1, maxLength: 255 },
        unit:        { type: 'string', enum: UNITS },
        minQuantity: { type: 'number', minimum: 0 },
        maxQuantity: { type: 'number', minimum: 0 }
    }
};

// schéma pre úpravu produktu (PUT /api/products/:id)
// rovnaká ako create, ale žiadne pole nie je povinné (môžeš zmeniť len jedno)
const updateProductSchema = {
    type: 'object',
    required: [],
    additionalProperties: false,
    properties: {
        name:        { type: 'string', minLength: 1, maxLength: 255 },
        unit:        { type: 'string', enum: UNITS },
        minQuantity: { type: 'number', minimum: 0 },
        maxQuantity: { type: 'number', minimum: 0 }
    }
};

// schéma pre query parametre listProducts (GET /api/products?search=...)
const listProductsSchema = {
    type: 'object',
    additionalProperties: false,
    properties: {
        search:   { type: 'string' },
        belowMin: { type: 'string', enum: ['true', 'false'] },
        aboveMax: { type: 'string', enum: ['true', 'false'] }
    }
};

module.exports = { createProductSchema, updateProductSchema, listProductsSchema };
