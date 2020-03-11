const express = require('express');
const app = express();
const router = express.Router();
const schema = require('./users.post.schema');
const usercontroller = require('./usercontroller');
const { logService, logError } = require('./logging');

app.listen(3000);
app.use(express.json());
app.use('/users', router);

router.route('/:id')
    .get(logService('getUserById'), (req, res) => {
        usercontroller.getById(req, res);
    }).delete(logService('deleteUser'), (req, res) => {
        usercontroller.delete(req, res);
    });

router.route('/')
    .get(logService('getUsers'), (req, res) => {
        if (!req.query.limit && !req.query.loginSubstring) {
            usercontroller.getAll(req, res);
        } else {
            const errors = validateParams(Number(req.query.limit), req.query.loginSubstring);
            usercontroller.getFilteredUsers(req, res, errors);
        }
    }).post(logService('createUser'), validateSchema(), (req, res) => {
        usercontroller.create(req, res);
    }).put(logService('updateUser'), validateSchema(), (req, res) => {
        usercontroller.update(req, res);
    });

router.use((err, req, res, next) => { // eslint-disable-line no-unused-vars
    const errorMessage = `${err} has occured.`;
    logError(errorMessage);
    res.status(500).json({ error: errorMessage });
});

process.on('uncaughtException', (err) => {
    logError(`Uncaught exception: ${err.message}
    ${err.stack}`);
    process.exit(1);
}).on('unhandledRejection', (err) => {
    logError(`Unhandled rejection : ${err.message}
    ${err.stack}`);
});

function validateParams(limit, loginSubstring) {
    const errors = [];
    if (!Number.isInteger(limit) || limit <= 0) {
        errors.push(`Parameter limit should be positive integer, but was ${limit}`);
    }
    if (loginSubstring === undefined) {
        errors.push('Parameter loginSubstring should not me empty');
    }
    return errors;
}

function validateSchema() {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false
        });

        if (!error) {
            return next();
        }
        res.status(422).json(errorResponse(error.details));
    };
}

function errorResponse(schemaErrors) {
    const errors = schemaErrors.map(error => {
        const { path, message } = error;
        return { path, message };
    });
    return {
        data: null,
        errors
    };
}
