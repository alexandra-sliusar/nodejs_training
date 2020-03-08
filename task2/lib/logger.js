const winston = require('winston');
const { printf } = winston.format;

const customFormat = printf(({ level, message }) => {
    return `${level.toUpperCase()} | ${message}`;
});

const transports = [
    new winston.transports.Console({
        timestamp: true,
        colorize: true,
        level: 'info'
    }),
    new winston.transports.File({
        filename: './logs/debug.log',
        name: 'debug',
        level: 'debug'
    }),
    new winston.transports.File({
        filename: './logs/error.log',
        name: 'error',
        level: 'error'
    })
];

module.exports = winston.createLogger({
    format: customFormat,
    transports });
