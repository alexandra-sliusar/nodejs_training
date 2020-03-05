const _ = require('underscore');
const users = [];

module.exports = {
    create: (req, res) => {
        pushUser(req, res, (user) => {
            const errors = [];
            users.push(user);
            res.status(201).json(getResponse(errors, user));
        }, (user) => {
            const errors = [];
            errors.push(`User with id ${user.id} already exists`);
            res.status(400).json(getResponse(errors, null));
        });
    },

    update: (req, res) => {
        pushUser(req, res, (user) => {
            const errors = [];
            errors.push(`User with id ${user.id} not found`);
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
        getUser(req, res, (user, data, errors) => {
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
            res.status(400).json(getResponse(errors, null));
        }
    },

    getById: (req, res) => {
        getUser(req, res, (user, data, errors) => {
            data = user;
            res.status(200).json(getResponse(errors, data));
        });
    }
};

function getResponse(errors, data) {
    return {
        errors,
        data
    };
}

function getUser(req, res, onSuccess) {
    const user = _.findWhere(users, { id: req.params.id });
    const errors = [];
    const data = null;

    if (!user) {
        errors.push(`User with id ${req.params.id} not found`);
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
