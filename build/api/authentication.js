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
  }), function (req, res) {
    var email = req.body.email;
    var errors = (0, _check.validationResult)(req);
    var host = getHost(req);

    if (!host) {
      return res.status(403).jsonp(errors.array());
    }

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      models.User.findOne({
        where: {
          email: email
        }
      }).then(function (user) {
        if (user) {
          var token = generateToken(email);
          var mailOptions = {
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
        } else {
          return res.status(404).send({
            message: 'User does not exists}'
          });
        }
      });
    }
  });
}

function login(app, models) {
  app.get('/api/login', function (req, res) {
    var token = req.query.token;

    if (!token) {
      return res.status(422).send({
        message: 'No token specified.'
      });
    } else {
      var decoded;

      try {
        decoded = _jsonwebtoken["default"].verify(token, process.env.JWT_SECRET);
      } catch (e) {
        return res.status(403).send({
          message: 'Token incorrect.'
        });
      }

      if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('expiration')) {
        return res.status(403).send({
          message: 'Token incorrect.'
        });
      }

      var _decoded = decoded,
          email = _decoded.email,
          expiration = _decoded.expiration;

      if (expiration < new Date()) {
        return res.status(403).send({
          message: 'Token expired.'
        });
      }

      models.User.findOne({
        where: {
          email: email
        }
      }).then(function (user) {
        if (!user) {
          return res.status(403).send({
            message: 'User does not exists'
          });
        } else {
          req.session.role = user.get('role');
          req.session.userID = user.get('id');
          console.log(req.session.role, user.get('role'), user.get('id'), req.session.id);
          req.session.authenticated = true;
          return res.status(200).send({
            message: 'Successfully signed in.'
          });
        }
      });
    }
  });
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
  hosts = ["".concat(process.env.HOST), 'https://flower.dev.diversus.me', 'https://flower.diversus.me', 'https://flowerblossom-dev.netlify.com'];
} else {
  hosts = ['http://localhost:3000'];
} // TODO not secure!!!


function getHost(req) {
  var host = req.headers.origin;
  console.log(host);

  if (hosts.indexOf(host) > -1) {
    return host;
  } else {
    return false;
  }
}