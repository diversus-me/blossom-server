"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initializeSessions;

var _expressSession = _interopRequireDefault(require("express-session"));

var _connectDynamodb = _interopRequireDefault(require("connect-dynamodb"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var maxAge = 86400000;
var options = {
  table: 'blossom-sessions',
  hashKey: 'sessionID',
  // Optional JSON object of AWS credentials and configuration
  AWSConfigJSON: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1'
  },
  // Optional ProvisionedThroughput params, defaults to 5
  readCapacityUnits: 5,
  writeCapacityUnits: 5
};
var DynamoDBStore = (0, _connectDynamodb["default"])(_expressSession["default"]);

function initializeSessions(app) {
  if (process.env.NODE_ENV === 'production') {
    app.use((0, _expressSession["default"])({
      store: new DynamoDBStore(options),
      secret: process.env.cookieSecret,
      key: 'user_sid',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: maxAge
      }
    }));
  } else {
    app.use((0, _expressSession["default"])({
      secret: 'development',
      key: 'user_sid',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge: maxAge
      }
    }));
  }
}