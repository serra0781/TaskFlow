const express = require('express');
const logger = require('./middlewares/logger');
const { notFound, errorHandler } = require('./middlewares/errorHandler');
const routes = require('./routes');

const app = express();

app.disable('x-powered-by');

// 1) Logger: tüm istekler kayıt altına alınır
app.use(logger);
// 2) JSON gövde ayrıştırma
app.use(express.json({ limit: '100kb' }));
// 3) Rotalar
app.use('/', routes);
// 4) 404 ve merkezi hata yönetimi
app.use(notFound);
app.use(errorHandler);

module.exports = app;
