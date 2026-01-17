const notFound = (req, res, next) => {
  res.status(404).json({
    error: {
      message: "Not Found",
      code: "NOT_FOUND"
    }
  });
};

module.exports = notFound;
