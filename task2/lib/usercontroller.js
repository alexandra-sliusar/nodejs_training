const _ = require('underscore');
const { logFullError } = require('./logging');
const jwt = require('jsonwebtoken');
const secret = process.env.SECRET;
const users = [{ id: '0', login: 'admin', password: 'password', age: 99, isDeleted: false }];

module.exports = {
    create: (req, res) => {
        pushUser(req, res, (user) => {
            const errors = [];
            users.push(user);
            res.status(201).json(getResponse(errors, user));
        }, (user) => {
            const errors = [];
            errors.push(`User with id ${user.id} already exists`);
            logFullError(req, errors, 'createUser');
            res.status(400).json(getResponse(errors, null));
        });
    },

    update: (req, res) => {
        pushUser(req, res, (user) => {
            const errors = [];
            errors.push(`User with id ${user.id} not found`);
            logFullError(req, errors, 'updateUser');
            res.status(404).json(getResponse(errors, null));
        }, (user) => {
            const errors = [];
            user.login = req.body.login;
            user.password = req.body.password;
            user.age = req.body.age;
            user.isDeleted = req.body.isDeleted;
            res.status(201).json(getResponse(errors, user));
        });
    },

    delete: (req, res) => {
        getUser(req, res, 'deleteUser', (user, data, errors) => {
            user.isDeleted = true;
            data = user;
            res.status(200).json(getResponse(errors, data));
        });
    },

    getAll: (req, res) => {
        res.status(200).json(getResponse([], users));
    },

    getFilteredUsers: (req, res, errors) => {
        const limit = Number(req.query.limit);
        const loginSubstring = req.query.loginSubstring;
        if (_.isEmpty(errors)) {
            res.status(200).json(getResponse(errors, getAutoSuggestUsers(limit, loginSubstring)));
        } else {
            logFullError(req, errors, 'getUsers');
            res.status(400).json(getResponse(errors, null));
        }
    },

    getById: (req, res) => {
        getUser(req, res, 'getUserById', (user, data, errors) => {
            data = user;
            res.status(200).json(getResponse(errors, data));
        });
    },

    login: (req, res) => {
        const errors = [];
        const user = _.findWhere(users, { login: req.body.login });

        if (!user || user.password !== req.body.password) {
            errors.push('Incorrect login and password combination');
            res.status(401).send(getResponse(errors, null));
        } else {
            const payload = { 'sub': user.id, 'isActive': user.isActive };
            const token = jwt.sign(payload, secret, { expiresIn: 20 });
            res.status(200).send(token);
        }
    },

    checkToken: (req, res, next) => {
        const token = req.headers['x-access-token'];
        if (token) {
            jwt.verify(token, secret, (err) => {
                if (err) {
                    res.status(403).send(getResponse(['Failed to authenticate token'], null));
                } else {
                    return next();
                }
            });
        } else {
            res.status(401).send(getResponse(['No token provided'], null));
        }
    }
};

function getResponse(errors, data) {
    return {
        errors,
        data
    };
}

function getUser(req, res, methodname, onSuccess) {
    const user = _.findWhere(users, { id: req.params.id });
    const errors = [];
    const data = null;

    if (!user) {
        errors.push(`User with id ${req.params.id} not found`);
        logFullError(req, errors, methodname);
        res.status(404).json(getResponse(errors, data));
    } else {
        onSuccess(user, data, errors);
    }
}

function pushUser(req, res, onNotFound, onFound) {
    const user  = req.body;
    const index = _.findIndex(users, { id: user.id });
    if (index === -1) {
        onNotFound(user);
    } else {
        onFound(users[index]);
    }
}

function getAutoSuggestUsers(limit, loginSubstring) {
    return _.chain(users)
        .filter(user => user.login.includes(loginSubstring))
        .sortBy('login')
        .first(limit)
        .value();
}
