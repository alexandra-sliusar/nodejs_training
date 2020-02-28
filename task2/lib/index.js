const _ = require('underscore');
const express = require('express');
const app = express();
const router = express.Router();
const schema = require('./users.post.schema');
const data = [];

app.listen(3000);
app.use(express.json());

router.param('id', (req, res, next, id) => {
    const user = _.findWhere(data, { id });
    if (user === undefined) {
        res.status(404).json(`User with id ${req.params.id} not found`);
    } else {
        req.user = user;
        return next();
    }
});

router.route('/:id')
    .get((req, res) => {
        res.json(req.user);
    }).delete((req, res) => {
        req.user.isDeleted = true;
        res.sendStatus(204);
    });

router.route('/')
    .get((req, res) => {
        const limit = Number(req.query.limit);
        const loginSubstring = req.query.loginSubstring;

        const errors = validateParams(limit, loginSubstring);
        if (_.isEmpty(errors)) {
            res.json(getAutoSuggestUsers(limit, loginSubstring));
        } else {
            res.status(400).json(errors);
        }
    }).post(validateSchema(), (req, res) => {
        const user  = req.body;
        const index = _.findIndex(data, { id: user.id });
        if (index === -1) {
            data.push(user);
        } else {
            data[index] = user;
        }
        res.sendStatus(204);
    });

app.use('/users', router);

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

function getAutoSuggestUsers(limit, loginSubstring) {
    return _.chain(data)
        .filter(user => user.login.includes(loginSubstring))
        .sortBy('login')
        .first(limit)
        .value();
}

function validateSchema() {
    return (req, res, next) => {
        const { error } = schema.validate(req.body, {
            abortEarly: false,
            allowUnknown: false
        });

        if (error === undefined) {
            return next();
        }
        res.status(400).json(errorResponse(error.details));
    };
}

function errorResponse(schemaErrors) {
    const errors = schemaErrors.map(error => {
        const { path, message } = error;
        return { path, message };
    });
    return {
        status: 'failed',
        errors };
}
