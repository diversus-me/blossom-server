"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.generateTransporter = generateTransporter;
exports.loginLink = loginLink;
exports.login = login;
exports.logout = logout;
exports.checkLogin = checkLogin;

var _jsonwebtoken = _interopRequireDefault(require("jsonwebtoken"));

var _nodemailer = _interopRequireDefault(require("nodemailer"));

var _check = require("express-validator/check");

var _htmlTemplate = _interopRequireDefault(require("./htmlTemplate"));

var _hosts = require("../hosts");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function generateTransporter() {
  const transporter = _nodemailer.default.createTransport({
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
  }), async (req, res) => {
    try {
      const {
        email
      } = req.body;
      const errors = (0, _check.validationResult)(req);
      const host = getHost(req);

      if (!host) {
        return res.status(403).jsonp(errors.array());
      }

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const user = await models.User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        return res.status(404).send({
          message: 'User does not exists'
        });
      }

      const token = generateToken(email);
      const mailOptions = {
        from: 'login@diversus.me',
        html: (0, _htmlTemplate.default)(`${host}/?token=${token}`),
        subject: 'Login',
        to: email
      };
      transporter.sendMail(mailOptions, error => {
        if (error) {
          return res.status(500).send({
            error
          });
        }

        return res.status(200).send({
          message: `Mail has been sent to ${email}`
        });
      });
    } catch (error) {
      return res.status(500).send('');
    }
  });
}

function login(app, models) {
  app.get('/api/login', async (req, res) => {
    try {
      const token = req.query.token;

      if (!token) {
        return res.status(422).send({
          message: 'No token specified.'
        });
      }

      let decoded;

      try {
        decoded = _jsonwebtoken.default.verify(token, process.env.JWT_SECRET);
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

      const {
        email,
        expiration
      } = decoded;

      if (new Date(expiration) < new Date()) {
        return res.status(403).send({
          message: 'Token expired.'
        });
      }

      const user = await models.User.findOne({
        where: {
          email
        }
      });

      if (!user) {
        return res.status(403).send({
          message: 'User does not exists'
        });
      }

      req.session.role = user.get('role');
      req.session.userID = user.get('id');
      req.session.authenticated = true;
      req.session.name = user.get('name');
      return res.status(200).send({
        message: 'Successfully signed in.',
        name: user.get('name'),
        role: user.get('role'),
        id: user.get('id')
      });
    } catch (error) {
      return res.status(500).send('');
    }
  });
}

function logout(app, models) {
  app.post('api/logout', (req, res) => {
    req.session.destroy();
    res.status(200).send({
      message: 'Successfully logged out.'
    });
  });
}

function checkLogin(app, models) {
  app.get('/api/checkLogin', (req, res) => {
    if (process.env.NODE_ENV === 'development' && process.env.ROLE) {
      req.session.role = process.env.ROLE;
      req.session.userID = process.env.ROLE === 'admin' ? 1 : 2;
      req.session.authenticated = true;
      req.session.name = 'Testuser';
      return res.status(200).send({
        message: 'Successfully signed in.',
        name: req.session.name,
        role: req.session.role,
        id: req.session.userID
      });
    } else {
      const {
        session
      } = req;

      if (!session.authenticated) {
        return res.status(403).send({
          message: 'Not Logged In'
        });
      } else {
        return res.status(200).send({
          message: 'Successfully signed in.',
          name: session.name,
          role: session.role,
          id: session.userID
        });
      }
    }
  });
}

function generateToken(email) {
  const date = new Date();
  date.setMinutes(date.getMinutes() + 15);
  return _jsonwebtoken.default.sign({
    email,
    expiration: date
  }, process.env.JWT_SECRET);
}

function getHost(req) {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000';
  }

  const host = req.headers.origin;

  if (_hosts.hosts.indexOf(host) > -1) {
    return host;
  } else {
    return false;
  }
}