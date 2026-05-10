require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const swaggerUi = require('swagger-ui-express');
const yaml = require('js-yaml');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// načítaj OpenAPI špecifikáciu zo YAML súboru
const openapiDocument = yaml.load(
    fs.readFileSync(path.join(__dirname, '../docs/openapi.yaml'), 'utf-8')
);

// middleware — spracúva každý request pred tým ako sa dostane k routom
app.use(cors());           // povolí požiadavky z iných domén (napr. React frontend)
app.use(morgan('dev'));    // loguje každý request do terminálu
app.use(express.json());  // parsuje JSON telo requestu

// routes
const productsRouter = require('./routes/products');
const movementsRouter = require('./routes/movements');
const dashboardRouter = require('./routes/dashboard');
app.use('/api/products', productsRouter);
app.use('/api/movements', movementsRouter);
app.use('/api/dashboard', dashboardRouter);

// Swagger UI — API dokumentácia dostupná na /api-docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiDocument));

// testovací endpoint — overí že server beží
app.get('/', (_req, res) => {
    res.json({ message: 'Storix API beží.' });
});

const errorHandler = require('./middleware/errorHandler');
app.use(errorHandler);

app.listen(PORT, () => {
    console.log(`Server beží na http://localhost:${PORT}`);
});
