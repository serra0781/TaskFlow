const ApiError = require('../utils/ApiError');

/** Tanımlı olmayan endpoint'ler için 404 döner. */
function notFound(req, res, next) {
  next(ApiError.notFound(`Endpoint bulunamadı: ${req.method} ${req.originalUrl}`));
}

/** Merkezi hata yakalayıcı. Tüm hatalar tek formatta döner. */
function errorHandler(err, req, res, next) {
  // express.json() bozuk JSON gövdesinde SyntaxError fırlatır.
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ success: false, message: 'Geçersiz JSON formatı' });
  }

  const statusCode = err instanceof ApiError ? err.statusCode : 500;
  if (statusCode === 500) console.error(err);

  const body = {
    success: false,
    message: statusCode === 500 ? 'Sunucu hatası' : err.message,
  };
  if (err.details) body.errors = err.details;

  res.status(statusCode).json(body);
}

module.exports = { notFound, errorHandler };
