const { AppError } = require('./errorHandler');

const notFound = (req, res, next) => {
  next(new AppError(`Not Found - ${req.originalUrl}`, 404));
};

module.exports = { notFound };
