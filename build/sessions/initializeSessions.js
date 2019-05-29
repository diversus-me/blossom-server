"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initializeSessions;

var _expressSession = _interopRequireDefault(require("express-session"));

var _connectDynamodb = _interopRequireDefault(require("connect-dynamodb"));

var _connectPgSimple = _interopRequireDefault(require("connect-pg-simple"));

var _pg = _interopRequireDefault(require("pg"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var maxAge = 86400000;

function initializeSessions(app) {
  var store = {};

  if (process.env.NODE_ENV === 'production') {
    var dynamoOptions = {
      table: 'blossom-sessions',
      hashKey: 'sessionID',
      AWSConfigJSON: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'eu-central-1'
      },
      readCapacityUnits: 5,
      writeCapacityUnits: 5
    };
    var DynamoDBStore = (0, _connectDynamodb["default"])(_expressSession["default"]);
    store = new DynamoDBStore(dynamoOptions);
  } else {
    // TODO: Postgres as local session store not working
    var postgresOptions = {
      pool: _pg["default"].Pool({
        user: process.env.RDS_USERNAME,
        host: process.env.RDS_HOSTNAME,
        database: process.env.RDS_DB_NAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT
      })
    };
    var PostgresStore = (0, _connectPgSimple["default"])(_expressSession["default"]); // store = new PostgresStore(postgresOptions)

    store = null;
  }

  app.use((0, _expressSession["default"])({
    store: store,
    secret: process.env.COOKIE_SECRET,
    key: 'user_sid',
    resave: false,
    saveUninitialized: true,
    cookie: {
      maxAge: maxAge
    }
  }));
}