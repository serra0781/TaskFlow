/**
 * HTTP durum kodu taşıyan uygulama hatası.
 * Controller/servis katmanında fırlatılır, errorHandler middleware'i yakalar.
 */
class ApiError extends Error {
  constructor(statusCode, message, details) {
    super(message);
    this.statusCode = statusCode;
    this.details = details;
  }

  static badRequest(message, details) {
    return new ApiError(400, message, details);
  }

  static notFound(message = 'Kaynak bulunamadı') {
    return new ApiError(404, message);
  }
}

module.exports = ApiError;
