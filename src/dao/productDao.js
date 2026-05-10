const db = require('../db/connection');

// pomocná funkcia — konvertuje snake_case stĺpce z DB na camelCase pre API
function toProduct(row) {
    if (!row) return null;
    return {
        id:              row.id,
        name:            row.name,
        unit:            row.unit,
        minQuantity:     row.min_quantity,
        maxQuantity:     row.max_quantity,
        currentQuantity: row.current_quantity,
        createdAt:       row.created_at,
        updatedAt:       row.updated_at
    };
}

// vloží nový produkt do databázy a vráti ho
function create(data) {
    const stmt = db.prepare(`
        INSERT INTO products (name, unit, min_quantity, max_quantity)
        VALUES (@name, @unit, @minQuantity, @maxQuantity)
    `);

    const result = stmt.run(data);

    // result.lastInsertRowid — id práve vloženého riadku
    return get(result.lastInsertRowid);
}

// vráti jeden produkt podľa id, alebo null ak neexistuje
function get(id) {
    const row = db.prepare('SELECT * FROM products WHERE id = ?').get(id);
    return toProduct(row);
}

// vráti zoznam produktov s voliteľnými filtrami
function list(filter = {}) {
    let query = 'SELECT * FROM products WHERE 1=1';
    const params = [];

    if (filter.search) {
        query += ' AND name LIKE ?';
        params.push(`%${filter.search}%`);
    }
    if (filter.belowMin) {
        query += ' AND current_quantity < min_quantity';
    }
    if (filter.aboveMax) {
        query += ' AND current_quantity > max_quantity';
    }

    query += ' ORDER BY name ASC';

    const rows = db.prepare(query).all(...params);
    return { itemList: rows.map(toProduct) };
}

// aktualizuje name, unit, minQuantity, maxQuantity — currentQuantity sa NIKDY nemení cez update
function update(id, data) {
    db.prepare(`
        UPDATE products
        SET name          = COALESCE(@name, name),
            unit          = COALESCE(@unit, unit),
            min_quantity  = COALESCE(@minQuantity, min_quantity),
            max_quantity  = COALESCE(@maxQuantity, max_quantity),
            updated_at    = CURRENT_TIMESTAMP
        WHERE id = @id
    `).run({ id, ...data });

    return get(id);
}

// vráti produkt podľa názvu (case-insensitive), alebo null
function getByName(name) {
    const row = db.prepare('SELECT * FROM products WHERE name = ? COLLATE NOCASE').get(name);
    return toProduct(row);
}

// zmení current_quantity o zadanú hodnotu (kladnú = príjem, zápornú = výdaj)
// volá sa VÝLUČNE z movementDao v rámci transakcie
function updateQuantity(id, change) {
    db.prepare(`
        UPDATE products
        SET current_quantity = current_quantity + ?,
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `).run(change, id);
}

// zmaže produkt — pohyby sa zmažú automaticky cez ON DELETE CASCADE
function remove(id) {
    db.prepare('DELETE FROM products WHERE id = ?').run(id);
}

module.exports = { create, get, getByName, list, update, updateQuantity, remove };
