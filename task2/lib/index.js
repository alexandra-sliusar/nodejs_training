const express = require('express');
const app = express();
const router = express.Router();
const schema = require('./users.post.schema');
const usercontroller = require('./usercontroller');

app.listen(3000);
app.use(express.json());
app.use('/users', router);

router.route('/:id')
    .get((req, res) => {
        usercontroller.getById(req, res);
    }).delete((req, res) => {
        usercontroller.delete(req, res);
    });

router.route('/')
    .get((req, res) => {
        if (!req.query.limit && !req.query.loginSubstring) {
            usercontroller.getAll(req, res);
        } else {
            const errors = validateParams(Number(req.query.limit), req.query.loginSubstring);
            usercontroller.getFilteredUsers(req, res, errors);
        }
    }).post(validateSchema(), (req, res) => {
        usercontroller.create(req, res);
    }).put(validateSchema(), (req, res) => {
        usercontroller.update(req, res);
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
