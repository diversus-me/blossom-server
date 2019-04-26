"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = connectPostgres;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function connectPostgres() {
  if (process.env.NODE_ENV === 'production') {
    return new _sequelize["default"](process.env.RDS_DB_NAME, process.env.RDS_USERNAME, process.env.RDS_PASSWORD, {
      host: process.env.RDS_HOSTNAME,
      port: process.env.RDS_PORT,
      dialect: 'postgres'
    });
  } else {
    return new _sequelize["default"]('blossom-dev', 'peter', '', {
      host: 'localhost',
      port: 5432,
      dialect: 'postgres'
    });
  }
}