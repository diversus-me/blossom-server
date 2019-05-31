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

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

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
  }),
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res) {
      var _req$body, name, email, role, errors, userFound, _ref2, _ref3, user, created;

      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _req$body = req.body, name = _req$body.name, email = _req$body.email, role = _req$body.role;
              errors = (0, _check.validationResult)(req);

              if (errors.isEmpty()) {
                _context.next = 5;
                break;
              }

              return _context.abrupt("return", res.status(422).jsonp(errors.array()));

            case 5:
              _context.next = 7;
              return models.User.findOne({
                where: _defineProperty({}, _sequelize.Op.or, [{
                  name: name
                }, {
                  email: email
                }])
              });

            case 7:
              userFound = _context.sent;

              if (!userFound) {
                _context.next = 10;
                break;
              }

              return _context.abrupt("return", res.status(409).send('User already exists'));

            case 10:
              _context.next = 12;
              return models.User.findOrCreate({
                where: {
                  name: name,
                  email: email,
                  role: role
                },
                defaults: {
                  joined: new Date()
                }
              });

            case 12:
              _ref2 = _context.sent;
              _ref3 = _slicedToArray(_ref2, 2);
              user = _ref3[0];
              created = _ref3[1];

              if (created) {
                _context.next = 18;
                break;
              }

              return _context.abrupt("return", res.status(409).send('User already exists'));

            case 18:
              return _context.abrupt("return", res.status(201).send('Created User'));

            case 21:
              _context.prev = 21;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", res.status(500).send(''));

            case 24:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 21]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

function deleteUser(app, models, checkAuth, checkAdmin) {
  app["delete"]('/api/user', checkAuth, checkAdmin, (0, _check.checkSchema)({
    email: {
      isEmail: true,
      errorMessage: 'Invalid Email'
    }
  }),
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(req, res) {
      var email, errors, user, rowDeleted;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              email = req.query.email;
              errors = (0, _check.validationResult)(req);

              if (errors.isEmpty()) {
                _context2.next = 5;
                break;
              }

              return _context2.abrupt("return", res.status(422).jsonp(errors.array()));

            case 5:
              _context2.next = 7;
              return models.User.findOne({
                where: {
                  email: email
                }
              });

            case 7:
              user = _context2.sent;

              if (user) {
                _context2.next = 10;
                break;
              }

              return _context2.abrupt("return", res.status(404).send('User does not exists'));

            case 10:
              _context2.next = 12;
              return models.User.destroy({
                where: {
                  email: email
                }
              });

            case 12:
              rowDeleted = _context2.sent;

              if (!(rowDeleted <= 0)) {
                _context2.next = 15;
                break;
              }

              return _context2.abrupt("return", res.status(409).send('User could not be deleted'));

            case 15:
              return _context2.abrupt("return", res.status(200).send('Deleted User'));

            case 18:
              _context2.prev = 18;
              _context2.t0 = _context2["catch"](0);
              return _context2.abrupt("return", res.send(500).send(''));

            case 21:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 18]]);
    }));

    return function (_x3, _x4) {
      return _ref4.apply(this, arguments);
    };
  }());
}