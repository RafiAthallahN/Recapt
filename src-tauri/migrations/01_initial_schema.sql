-- Initial SQLite Schema for Recapt Finance Tracker

CREATE TABLE IF NOT EXISTS transactions (
    id                    TEXT PRIMARY KEY,
    date                  TEXT NOT NULL,
    type                  TEXT NOT NULL CHECK (type IN ('income', 'outcome', 'saving')),
    description           TEXT NOT NULL,
    amount                INTEGER NOT NULL,
    category              TEXT,
    recurring_template_id TEXT,
    wishlist_item_id      TEXT,
    created_at            TEXT NOT NULL,
    updated_at            TEXT NOT NULL,
    is_deleted            INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);

CREATE TABLE IF NOT EXISTS recurring_templates (
    id                  TEXT PRIMARY KEY,
    description         TEXT NOT NULL,
    amount              INTEGER NOT NULL,
    type                TEXT NOT NULL CHECK (type IN ('income', 'outcome', 'saving')),
    category            TEXT,
    day_of_month        INTEGER NOT NULL CHECK (day_of_month BETWEEN 1 AND 31),
    start_date          TEXT NOT NULL,
    total_installments  INTEGER,
    installments_paid   INTEGER NOT NULL DEFAULT 0,
    active              INTEGER NOT NULL DEFAULT 1,
    created_at          TEXT NOT NULL,
    updated_at          TEXT NOT NULL,
    is_deleted          INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS wishlist_items (
    id          TEXT PRIMARY KEY,
    name        TEXT NOT NULL,
    price       INTEGER NOT NULL,
    bought      INTEGER NOT NULL DEFAULT 0,
    created_at  TEXT NOT NULL,
    updated_at  TEXT NOT NULL,
    is_deleted  INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS sync_meta (
    key         TEXT PRIMARY KEY,
    value       TEXT NOT NULL,
    updated_at  TEXT NOT NULL
);

-- Computed Views
CREATE VIEW IF NOT EXISTS weekly_totals AS
SELECT
    strftime('%Y-W%W', date) AS week,
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END) AS income,
    SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END) AS outcome,
    SUM(CASE WHEN type = 'saving'  THEN amount ELSE 0 END) AS saving
FROM transactions
WHERE is_deleted = 0
GROUP BY week;

CREATE VIEW IF NOT EXISTS net_income AS
SELECT
    SUM(CASE WHEN type = 'income'  THEN amount ELSE 0 END)
  - SUM(CASE WHEN type = 'outcome' THEN amount ELSE 0 END)
  - SUM(CASE WHEN type = 'saving'  THEN amount ELSE 0 END) AS net
FROM transactions
WHERE is_deleted = 0;

CREATE VIEW IF NOT EXISTS wishlist_leftover AS
SELECT
    (SELECT COALESCE(net, 0) FROM net_income) -
    (SELECT COALESCE(SUM(price), 0) FROM wishlist_items WHERE bought = 0 AND is_deleted = 0) AS leftover;
