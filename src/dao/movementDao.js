const db = require('../db/connection');
const productDao = require('./productDao');

// pomocná funkcia — konvertuje riadok z DB na camelCase objekt
function toMovement(row) {
    if (!row) return null;
    return {
        id:          row.id,
        productId:   row.product_id,
        productName: row.product_name,
        type:        row.type,
        quantity:    row.quantity,
        note:        row.note,
        createdAt:   row.created_at,
        updatedAt:   row.updated_at
    };
}

// vloží pohyb a v transakcii aktualizuje current_quantity produktu
function create(data) {
    // better-sqlite3 transakcia — funkcia sa vykoná atomicky
    const run = db.transaction(() => {
        const result = db.prepare(`
            INSERT INTO movements (product_id, type, quantity, note)
            VALUES (@productId, @type, @quantity, @note)
        `).run(data);

        // pri vydaj odpočítame (záporná zmena), pri príjme pripočítame
        const change = data.type === 'vydaj' ? -data.quantity : data.quantity;
        productDao.updateQuantity(data.productId, change);

        return get(result.lastInsertRowid);
    });

    return run();
}

// vráti jeden pohyb podľa id, vrátane názvu produktu cez JOIN
function get(id) {
    const row = db.prepare(`
        SELECT m.*, p.name AS product_name
        FROM movements m
        JOIN products p ON p.id = m.product_id
        WHERE m.id = ?
    `).get(id);

    return toMovement(row);
}

// zmaže pohyb a v transakcii vráti zásoby späť
// vráti { ok: true } alebo vyhodí chybu ak by zásoby išli do mínusu
function remove(id) {
    const run = db.transaction(() => {
        const movement = get(id);
        if (!movement) return null;

        // reverz zmeny: prijem bol kladný, takže reverz je záporný (a naopak)
        const reversal = movement.type === 'prijem' ? -movement.quantity : movement.quantity;

        // skontroluj či reverz nespôsobí záporné zásoby
        const product = db.prepare('SELECT current_quantity FROM products WHERE id = ?').get(movement.productId);
        if (product.current_quantity + reversal < 0) {
            throw { code: 'insufficientStock', available: product.current_quantity };
        }

        productDao.updateQuantity(movement.productId, reversal);
        db.prepare('DELETE FROM movements WHERE id = ?').run(id);
        return { ok: true };
    });

    return run();
}

// aktualizuje iba note pohybu
function update(id, data) {
    db.prepare(`
        UPDATE movements
        SET note = COALESCE(@note, note),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = @id
    `).run({ id, ...data });
    return get(id);
}

// vráti zoznam pohybov s voliteľnými filtrami a stránkovaním
function list(filter = {}) {
    let query = `
        SELECT m.*, p.name AS product_name
        FROM movements m
        JOIN products p ON p.id = m.product_id
        WHERE 1=1
    `;
    const params = [];

    if (filter.productId) {
        query += ' AND m.product_id = ?';
        params.push(Number(filter.productId));
    }
    if (filter.productName) {
        query += ' AND p.name LIKE ?';
        params.push(`%${filter.productName}%`);
    }
    if (filter.type) {
        query += ' AND m.type = ?';
        params.push(filter.type);
    }
    if (filter.dateFrom) {
        query += ' AND DATE(m.created_at) >= ?';
        params.push(filter.dateFrom);
    }
    if (filter.dateTo) {
        query += ' AND DATE(m.created_at) <= ?';
        params.push(filter.dateTo);
    }

    // zoradenie — predvolene od najnovšieho
    const sort = filter.sort === 'oldest' ? 'ASC' : 'DESC';
    query += ` ORDER BY m.created_at ${sort}`;

    // stránkovanie
    const limit = Math.min(Number(filter.limit) || 20, 100);
    const page  = Math.max(Number(filter.page)  || 1,  1);
    const offset = (page - 1) * limit;
    query += ' LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const rows = db.prepare(query).all(...params);
    return { itemList: rows.map(toMovement) };
}

module.exports = { create, get, update, remove, list };
