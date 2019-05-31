"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTransporter = generateTransporter;
exports.loginLink = loginLink;
exports.login = login;
exports.checkLogin = checkLogin;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _check = require("express-validator/check");

var _htmlTemplate = _interopRequireDefault(require("./htmlTemplate"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

function generateTransporter() {
  var transporter = _nodemailer["default"].createTransport({
    auth: {
      pass: process.env.EMAIL_PASSWORD,
      user: process.env.EMAIL_USER
    },
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false
  });

  transporter.verify(function (error, success) {
    if (error) {
      console.log(error);
    } else {
      console.log('Server is ready to take our messages');
    }
  });
  return transporter;
}

function loginLink(app, models, transporter) {
  app.post('/api/requestLoginLink', (0, _check.checkSchema)({
    email: {
      isEmail: true,
      errorMessage: 'Invalid email'
    }
  }),
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res) {
      var email, errors, host, user, token, mailOptions;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              email = req.body.email;
              errors = (0, _check.validationResult)(req);
              host = getHost(req);

              if (host) {
                _context.next = 6;
                break;
              }

              return _context.abrupt("return", res.status(403).jsonp(errors.array()));

            case 6:
              if (errors.isEmpty()) {
                _context.next = 8;
                break;
              }

              return _context.abrupt("return", res.status(422).jsonp(errors.array()));

            case 8:
              _context.next = 10;
              return models.User.findOne({
                where: {
                  email: email
                }
              });

            case 10:
              user = _context.sent;

              if (user) {
                _context.next = 13;
                break;
              }

              return _context.abrupt("return", res.status(404).send({
                message: 'User does not exists'
              }));

            case 13:
              token = generateToken(email);
              mailOptions = {
                from: 'login@diversus.me',
                html: (0, _htmlTemplate["default"])("".concat(host, "/?token=").concat(token)),
                subject: 'Login',
                to: email
              };
              transporter.sendMail(mailOptions, function (error) {
                if (error) {
                  return res.status(500).send({
                    error: error
                  });
                }

                return res.status(200).send({
                  message: "Mail has been sent to ".concat(email)
                });
              });
              _context.next = 21;
              break;

            case 18:
              _context.prev = 18;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", res.status(500).send(''));

            case 21:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 18]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

function login(app, models) {
  app.get('/api/login',
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(req, res) {
      var token, decoded, _decoded, email, expiration, user;

      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              token = req.query.token;

              if (token) {
                _context2.next = 4;
                break;
              }

              return _context2.abrupt("return", res.status(422).send({
                message: 'No token specified.'
              }));

            case 4:
              _context2.prev = 4;
              decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
              _context2.next = 11;
              break;

            case 8:
              _context2.prev = 8;
              _context2.t0 = _context2["catch"](4);
              return _context2.abrupt("return", res.status(403).send({
                message: 'Token incorrect.'
              }));

            case 11:
              if (!(!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('expiration'))) {
                _context2.next = 13;
                break;
              }

              return _context2.abrupt("return", res.status(403).send({
                message: 'Token incorrect.'
              }));

            case 13:
              _decoded = decoded, email = _decoded.email, expiration = _decoded.expiration;

              if (!(new Date(expiration) < new Date())) {
                _context2.next = 16;
                break;
              }

              return _context2.abrupt("return", res.status(403).send({
                message: 'Token expired.'
              }));

            case 16:
              _context2.next = 18;
              return models.User.findOne({
                where: {
                  email: email
                }
              });

            case 18:
              user = _context2.sent;

              if (user) {
                _context2.next = 21;
                break;
              }

              return _context2.abrupt("return", res.status(403).send({
                message: 'User does not exists'
              }));

            case 21:
              req.session.role = user.get('role');
              req.session.userID = user.get('id');
              console.log(req.session.role, user.get('role'), user.get('id'), req.session.id);
              req.session.authenticated = true;
              return _context2.abrupt("return", res.status(200).send({
                message: 'Successfully signed in.'
              }));

            case 28:
              _context2.prev = 28;
              _context2.t1 = _context2["catch"](0);
              return _context2.abrupt("return", res.status(500).send(''));

            case 31:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 28], [4, 8]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
}

function checkLogin(app, models) {
  app.get('/api/checkLogin', function (req, res) {
    var session = req.session;

    if (!session.authenticated) {
      return res.status(403).send({
        message: 'Not Logged In'
      });
    } else {
      return res.status(200).send({
        message: 'Successfully signed in.'
      });
    }
  });
}

function generateToken(email) {
  var date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  return _jsonwebtoken["default"].sign({
    email: email,
    expiration: date
  }, process.env.JWT_SECRET);
} // TODO correctly handle possible hosts for development and production


var hosts = [];

if (process.env.NODE_ENV === 'production') {
  hosts = ["".concat(process.env.HOST), 'https://flower.dev.diversus.me', 'https://flower.diversus.me', 'https://flowerblossom-dev.netlify.com', 'https://nettz.diversus.me'];
} else {
  hosts = ['http://localhost:3000'];
} // TODO maybe not secure!!!


function getHost(req) {
  var host = req.headers.origin;
  console.log(host);

  if (hosts.indexOf(host) > -1) {
    return host;
  } else {
    return false;
  }
}