const errorHandler = (err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || "Internal Server Error";
  const code = err.code || "INTERNAL_ERROR";

  res.status(status).json({
    error: {
      message,
      code
    }
  });
};

module.exports = errorHandler;
