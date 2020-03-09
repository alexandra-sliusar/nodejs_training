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
    }
};
