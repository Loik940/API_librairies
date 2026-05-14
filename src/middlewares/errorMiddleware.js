const notFound = (req, res) => {
  return res.status(404).json({
    success: false,
    message: 'Route not found',
  });
};

const errorHandler = (err, req, res, next) => {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;

  return res.status(statusCode).json({
    success: false,
    message: err.message || 'Server error',
  });
};

module.exports = {
  notFound,
  errorHandler,
};
