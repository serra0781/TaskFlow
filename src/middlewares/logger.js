const fs = require('fs');
const path = require('path');
const config = require('../config');

fs.mkdirSync(path.dirname(config.logFile), { recursive: true });

/**
 * Temel Logger Middleware
 * Her isteğin method, endpoint ve zaman damgasını konsola ve
 * logs/requests.log dosyasına yazar. İstek tamamlandığında durum kodu
 * ve süre de kaydedilir.
 *
 * Örnek satır:
 * [2026-11-16T18:30:12.123Z] GET /tasks?status=completed 200 - 3.41 ms
 */
function logger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const timestamp = new Date().toISOString();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1e6;
    const line = `[${timestamp}] ${req.method} ${req.originalUrl} ${res.statusCode} - ${durationMs.toFixed(2)} ms`;

    if (config.logToConsole) console.log(line);
    fs.appendFile(config.logFile, line + '\n', (err) => {
      if (err) console.error('Log dosyasına yazılamadı:', err.message);
    });
  });

  next();
}

module.exports = logger;
