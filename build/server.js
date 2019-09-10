"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _hosts = require("./hosts");

var _connectPostgres = _interopRequireDefault(require("./postgres/connectPostgres"));

var _initPostgres = _interopRequireDefault(require("./postgres/initPostgres"));

var _initializeSessions = _interopRequireDefault(require("./sessions/initializeSessions"));

var _defineAPI = _interopRequireDefault(require("./defineAPI"));

var _uppy = _interopRequireDefault(require("./uppy"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* eslint-disable import/first */
require('dotenv').config();

const PORT = process.env.HTTP_PORT || 8081;
const app = (0, _express.default)();
/* Connect to Database */

const postgres = (0, _connectPostgres.default)();
postgres.authenticate().then(() => {
  console.log('Connection to database established.');
}).catch(err => {
  console.error('Unable to connect to the database:', err);
});
(0, _initializeSessions.default)(app);
/* Sync with Database */

const models = (0, _initPostgres.default)(postgres);
app.use((0, _cors.default)({
  credentials: true,
  origin: function (origin, callback) {
    if (_hosts.hosts.indexOf(origin) !== -2) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  }
}));
app.use(_express.default.json());
app.use(_express.default.urlencoded());
/* Initiate API */

(0, _defineAPI.default)(app, models);
app.use((0, _uppy.default)());
app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`);
});
app.listen(3020, () => {
  console.log(`Server listening at port 3020.`);
});