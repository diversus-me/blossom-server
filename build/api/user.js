"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createUser = createUser;
exports.deleteUser = deleteUser;

var _check = require("express-validator/check");

var _sequelize = require("sequelize");

function _slicedToArray(arr, i) { return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _nonIterableRest(); }

function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance"); }

function _iterableToArrayLimit(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"] != null) _i["return"](); } finally { if (_d) throw _e; } } return _arr; }

function _arrayWithHoles(arr) { if (Array.isArray(arr)) return arr; }

function _defineProperty(obj, key, value) { if (key in obj) { Object.defineProperty(obj, key, { value: value, enumerable: true, configurable: true, writable: true }); } else { obj[key] = value; } return obj; }

function createUser(app, models, checkAuth, checkAdmin) {
  app.post('/api/user', checkAuth, checkAdmin, (0, _check.checkSchema)({
    name: {
      isString: {
        errorMessage: 'Name is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Name is empty'
      }
    },
    email: {
      isEmail: true,
      errorMessage: 'Invalid Email'
    },
    role: {
      isString: true,
      errorMessage: 'Invalid Role'
    }
  }), function (req, res) {
    var _req$body = req.body,
        name = _req$body.name,
        email = _req$body.email,
        role = _req$body.role;
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      models.User.findOne({
        where: _defineProperty({}, _sequelize.Op.or, [{
          name: name
        }, {
          email: email
        }])
      }).then(function (user) {
        if (!user) {
          models.User.findOrCreate({
            where: {
              name: name,
              email: email,
              role: role
            },
            defaults: {
              joined: new Date()
            }
          }).then(function (_ref) {
            var _ref2 = _slicedToArray(_ref, 2),
                user = _ref2[0],
                created = _ref2[1];

            if (created) {
              return res.status(201).send('Created User');
            } else {
              return res.status(409).send('User already exists');
            }
          });
        } else {
          return res.status(409).send('User already exists');
        }
      });
    }
  });
}

function deleteUser(app, models, checkAuth, checkAdmin) {
  app["delete"]('/api/user', checkAuth, checkAdmin, (0, _check.checkSchema)({
    email: {
      isEmail: true,
      errorMessage: 'Invalid Email'
    }
  }), function (req, res) {
    var email = req.query.email;
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      models.User.findOne({
        where: {
          email: email
        }
      }).then(function (user) {
        if (user) {
          models.User.destroy({
            where: {
              email: email
            }
          }).then(function (rowDeleted) {
            if (rowDeleted >= 1) {
              return res.status(200).send('Deleted User');
            } else {
              return res.status(409).send('User could not be deleted');
            }
          });
        } else {
          return res.status(404).send('User does not exists');
        }
      });
    }
  });
}