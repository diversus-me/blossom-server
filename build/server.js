"use strict";

var _express = _interopRequireDefault(require("express"));

var _cors = _interopRequireDefault(require("cors"));

var _connectPostgres = _interopRequireDefault(require("./postgres/connectPostgres"));

var _initPostgres = _interopRequireDefault(require("./postgres/initPostgres"));

var _initializeSessions = _interopRequireDefault(require("./sessions/initializeSessions"));

var _defineAPI = _interopRequireDefault(require("./defineAPI"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var PORT = process.env.HTTP_PORT || 8081;
var app = (0, _express["default"])();
/* Connect to Database */

var postgres = (0, _connectPostgres["default"])();
postgres.authenticate().then(function () {
  console.log('Connection to database established.');
})["catch"](function (err) {
  console.error('Unable to connect to the database:', err);
});
/* Sync with Database */

var models = (0, _initPostgres["default"])(postgres);

var getVideoId = require('get-video-id');

console.log(getVideoId('test'));
(0, _initializeSessions["default"])(app);
app.use((0, _cors["default"])({
  credentials: true,
  origin: "".concat(process.env.HOST)
}));
app.use(_express["default"].json());
app.use(_express["default"].urlencoded());
/* Initiate API */

(0, _defineAPI["default"])(app, models);
app.listen(PORT, function () {
  console.log("Server listening at port ".concat(PORT, "."));
});