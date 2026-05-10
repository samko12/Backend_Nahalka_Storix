CREATE TABLE IF NOT EXISTS products (
    id              INTEGER         PRIMARY KEY AUTOINCREMENT,
    name            VARCHAR(255)    NOT NULL UNIQUE COLLATE NOCASE,
    unit            VARCHAR(20)     NOT NULL,
    min_quantity    DECIMAL(10,2)   NOT NULL CHECK (min_quantity >= 0),
    max_quantity    DECIMAL(10,2)   NOT NULL,
    current_quantity DECIMAL(10,2)  NOT NULL DEFAULT 0 CHECK (current_quantity >= 0),
    created_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- max musí byť vždy väčšie ako min
    CHECK (max_quantity > min_quantity),
    -- povolené jednotky
    CHECK (unit IN ('ks','kg','g','m','cm','l','ml','balenie'))
);

CREATE TABLE IF NOT EXISTS movements (
    id          INTEGER         PRIMARY KEY AUTOINCREMENT,
    product_id  INTEGER         NOT NULL,
    type        VARCHAR(10)     NOT NULL,
    quantity    DECIMAL(10,2)   NOT NULL CHECK (quantity > 0),
    note        TEXT,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    -- typ môže byť len prijem alebo vydaj
    CHECK (type IN ('prijem','vydaj')),
    -- väzba na produkt: ak zmažeš produkt, zmažú sa aj jeho pohyby
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE
);

-- indexy pre rýchlejšie vyhľadávanie
CREATE INDEX IF NOT EXISTS idx_movements_product_id ON movements(product_id);
CREATE INDEX IF NOT EXISTS idx_movements_type       ON movements(type);
CREATE INDEX IF NOT EXISTS idx_movements_created_at ON movements(created_at);
