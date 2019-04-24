"use strict";

var _express = _interopRequireDefault(require("express"));

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// const pgp = require('pg-promise')()
// const connection = {}
// if (process.env.NODE_ENV === 'production') {
//   const connection = {
//     host: process.env.RDS_HOSTNAME,
//     port: process.env.RDS_PORT,
//     database: process.env.RDS_DB_NAME,
//     user: process.env.RDS_USERNAME,
//     password: process.env.RDS_PASSWORD
//   }
// }
// const db = pgp(connection)
var db = new _sequelize["default"](process.env.RDS_DB_NAME, process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
  host: process.env.RDS_HOSTNAME,
  port: process.env.RDS_PORT,
  dialect: 'postgres'
});
db.authenticate().then(function () {
  console.log('Connection to database established.');
})["catch"](function (err) {
  console.error('Unable to connect to the database:', err);
});
var PORT = process.env.HTTP_PORT || 8081;
var app = (0, _express["default"])();
app.get('/flowers', function (req, res) {
  res.json({
    name: 'Dandelion',
    colour: 'Blue-ish'
  });
});
app.listen(PORT, function () {
  console.log("Server listening at port ".concat(PORT, "."));
});
