const logger = require('../utils/logger');

const errorHandler = (err, req, res, next) => {
  if (!err) {
    logger.error("No error object passed to error handler");
    return res.status(500).json({
      message: "Something went wrong, but no error details were provided.",
    });
  }

  logger.error(err.stack || err.message || "Unknown error occurred");

    res.status(err.status || 500).json({
    message: err.message || "Internal Server Error!",
  });
};

module.exports = errorHandler;
