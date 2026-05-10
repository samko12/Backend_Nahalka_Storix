const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');

// cesta k SQLite súboru — uložíme ho do koreňa projektu
const DB_PATH = path.join(__dirname, '../../storix.db');

// cesta k SQL schéme
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

// otvorí existujúcu databázu, alebo vytvorí novú ak neexistuje
const db = new Database(DB_PATH);

// SQLite má foreign keys štandardne vypnuté — musíme ich zapnúť ručne
db.pragma('foreign_keys = ON');

// načítaj a spusti schema.sql — vytvorí tabuľky ak ešte neexistujú
const schema = fs.readFileSync(SCHEMA_PATH, 'utf-8');
db.exec(schema);

module.exports = db;
