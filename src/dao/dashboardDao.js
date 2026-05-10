const db = require('../db/connection');

function getSummary() {
    // počty produktov — tri dotazy naraz cez WITH (CTE)
    const counts = db.prepare(`
        SELECT
            COUNT(*)                                          AS total,
            SUM(CASE WHEN current_quantity < min_quantity THEN 1 ELSE 0 END) AS below_min,
            SUM(CASE WHEN current_quantity > max_quantity THEN 1 ELSE 0 END) AS above_max
        FROM products
    `).get();

    // posledných 5 pohybov
    const recentMovements = db.prepare(`
        SELECT m.*, p.name AS product_name
        FROM movements m
        JOIN products p ON p.id = m.product_id
        ORDER BY m.created_at DESC
        LIMIT 5
    `).all();

    return {
        totalProducts:    counts.total,
        belowMinCount:    counts.below_min,
        aboveMaxCount:    counts.above_max,
        recentMovements:  recentMovements.map(row => ({
            id:          row.id,
            productId:   row.product_id,
            productName: row.product_name,
            type:        row.type,
            quantity:    row.quantity,
            note:        row.note,
            createdAt:   row.created_at,
            updatedAt:   row.updated_at
        }))
    };
}

module.exports = { getSummary };
