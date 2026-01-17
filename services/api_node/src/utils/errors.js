class AppError extends Error {
  constructor(message, status = 500, code = "INTERNAL_ERROR") {
    super(message);
    this.status = status;
    this.code = code;
  }
}

const createError = (status, code, message) => new AppError(message, status, code);

module.exports = {
  AppError,
  createError
};
