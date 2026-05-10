const productDao = require('../dao/productDao');

async function create(req, res, next) {
    try {
        const { name, unit, minQuantity, maxQuantity } = req.body;

        // business validácia: maxQuantity musí byť väčšia ako minQuantity
        if (maxQuantity <= minQuantity) {
            return res.status(400).json({
                error: 'invalidQuantityRange',
                message: 'maxQuantity must be greater than minQuantity.',
                params: { minQuantity, maxQuantity }
            });
        }

        // kontrola unikátnosti názvu (case-insensitive)
        const existing = productDao.getByName(name);
        if (existing) {
            return res.status(409).json({
                error: 'productNameNotUnique',
                message: 'Product with given name already exists.',
                params: { name }
            });
        }

        const product = productDao.create({ name, unit, minQuantity, maxQuantity });

        return res.status(201).json(product);
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const id = Number(req.params.id);
        const product = productDao.get(id);

        if (!product) {
            return res.status(404).json({
                error: 'productDoesNotExist',
                message: 'Product with given id does not exist.',
                params: { id }
            });
        }

        return res.status(200).json(product);
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        // belowMin a aboveMax prídu ako string "true"/"false" — prekonvertujeme na boolean
        const filter = {
            search:   req.query.search,
            belowMin: req.query.belowMin === 'true',
            aboveMax: req.query.aboveMax === 'true'
        };

        const result = productDao.list(filter);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = Number(req.params.id);

        const product = productDao.get(id);
        if (!product) {
            return res.status(404).json({
                error: 'productDoesNotExist',
                message: 'Product with given id does not exist.',
                params: { id }
            });
        }

        // vypočítame výsledné hodnoty po update (COALESCE logika — ak nie je v body, použijeme pôvodnú)
        const newMin = req.body.minQuantity ?? product.minQuantity;
        const newMax = req.body.maxQuantity ?? product.maxQuantity;

        if (newMax <= newMin) {
            return res.status(400).json({
                error: 'invalidQuantityRange',
                message: 'maxQuantity must be greater than minQuantity.',
                params: { minQuantity: newMin, maxQuantity: newMax }
            });
        }

        // kontrola unikátnosti názvu ak sa mení
        if (req.body.name) {
            const existing = productDao.getByName(req.body.name);
            if (existing && existing.id !== id) {
                return res.status(409).json({
                    error: 'productNameNotUnique',
                    message: 'Product with given name already exists.',
                    params: { name: req.body.name }
                });
            }
        }

        const updated = productDao.update(id, req.body);
        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const id = Number(req.params.id);

        const product = productDao.get(id);
        if (!product) {
            return res.status(404).json({
                error: 'productDoesNotExist',
                message: 'Product with given id does not exist.',
                params: { id }
            });
        }

        productDao.remove(id);

        // 204 = úspech, ale bez obsahu (nič nevraciame)
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

module.exports = { create, getOne, update, remove, list };
