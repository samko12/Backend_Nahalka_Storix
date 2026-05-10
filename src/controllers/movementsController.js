const movementDao = require('../dao/movementDao');
const productDao = require('../dao/productDao');

async function create(req, res, next) {
    try {
        const { productId, type, quantity, note } = req.body;

        // produkt musí existovať
        const product = productDao.get(productId);
        if (!product) {
            return res.status(404).json({
                error: 'productDoesNotExist',
                message: 'Product with given id does not exist.',
                params: { productId }
            });
        }

        // pri výdaji skontrolujeme dostatok zásob
        if (type === 'vydaj' && quantity > product.currentQuantity) {
            return res.status(400).json({
                error: 'insufficientStock',
                message: 'Insufficient stock for this operation.',
                params: { requested: quantity, available: product.currentQuantity }
            });
        }

        const movement = movementDao.create({ productId, type, quantity, note: note ?? null });
        return res.status(201).json(movement);
    } catch (err) {
        next(err);
    }
}

async function remove(req, res, next) {
    try {
        const id = Number(req.params.id);
        const movement = movementDao.get(id);
        if (!movement) {
            return res.status(404).json({
                error: 'movementDoesNotExist',
                message: 'Movement with given id does not exist.'
            });
        }
        try {
            movementDao.remove(id);
        } catch (e) {
            if (e.code === 'insufficientStock') {
                return res.status(400).json({
                    error: 'insufficientStock',
                    message: 'Deleting this movement would cause negative stock.',
                    params: { available: e.available }
                });
            }
            throw e;
        }
        return res.status(204).send();
    } catch (err) {
        next(err);
    }
}

async function update(req, res, next) {
    try {
        const id = Number(req.params.id);
        const movement = movementDao.get(id);
        if (!movement) {
            return res.status(404).json({
                error: 'movementDoesNotExist',
                message: 'Movement with given id does not exist.'
            });
        }
        const updated = movementDao.update(id, req.body);
        return res.status(200).json(updated);
    } catch (err) {
        next(err);
    }
}

async function getOne(req, res, next) {
    try {
        const movement = movementDao.get(Number(req.params.id));
        if (!movement) {
            return res.status(404).json({
                error: 'movementDoesNotExist',
                message: 'Movement with given id does not exist.'
            });
        }
        return res.status(200).json(movement);
    } catch (err) {
        next(err);
    }
}

async function list(req, res, next) {
    try {
        const result = movementDao.list(req.query);
        return res.status(200).json(result);
    } catch (err) {
        next(err);
    }
}

module.exports = { create, remove, update, getOne, list };
