# Storix — Skladová aplikácia
Jednoduchý backend pre správu skladu. REST API postavené na Node.js + Express + SQLite.

## Funkcie
- Evidencia produktov (názov, jednotka, min/max zásoba)
- Príjem a výdaj tovaru (pohyby)
- História pohybov s filtrovaním a stránkovaním
- Dashboard s prehľadom kritických zásob

## Technológie
- Node.js + Express.js
- SQLite (better-sqlite3)
- AJV validácia
- Swagger UI dokumentácia

## Spustenie
```bash
# 1. Nainštaluj závislosti
npm install

# 2. Vytvor konfiguráciu
cp .env.example .env

# 3. Spusti server
npm start
```

API dokumentácia je dostupná na `http://localhost:3000/api-docs` po spustení.
