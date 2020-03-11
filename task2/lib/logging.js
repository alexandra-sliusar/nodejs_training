const logger = require('./logger');

module.exports = {
    logService: (methodname) => {
        return (req, res, next) => {
            logger.info(`Request: ${req.method} ${req.originalUrl}, ${methodname}`);
            next();
        };
    },

    logError: (message) => {
        logger.error(message);
    },

    logFullError: (req, errors, methodname) => {
        logger.error(`Request: ${req.method} ${req.originalUrl},
      Request body: ${JSON.stringify(req.body)},
      Method: ${methodname},
      Errors: ${errors}`);
    }
};
