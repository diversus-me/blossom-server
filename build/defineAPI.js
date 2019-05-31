"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = defineAPI;

var _user = require("./api/user");

var _authentication = require("./api/authentication");

var _flower = require("./api/flower");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _moment = _interopRequireDefault(require("moment"));

var _momentDurationFormat = _interopRequireDefault(require("moment-duration-format"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

// eslint-disable-line no-unused-vars
var getVideoId = require('get-video-id');

function checkAuth(req, res, next) {
  if (req.session.authenticated) {
    next();
  }

  return res.status(403);
}

function checkAdmin(req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    console.log('req.session.role');
    next();
  }

  return res.status(403);
}

function checkStatus(res) {
  if (res.ok) {
    return res.json();
  } else {
    throw Error('Connection Fail');
  }
}

function defineAPI(app, models) {
  (0, _flower.getFlowers)(app, models);
  app.get('/api/videoLength', function (req, res) {
    var vidId = getVideoId(req.query.videolink).id;

    if (!vidId) {
      return res.status(424).send('Video not found');
    }

    (0, _nodeFetch["default"])("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(vidId, "&key=").concat(process.env.YOUTUBE_API_KEY)).then(checkStatus).then(function (body) {
      if (!body.items[0]) {
        throw Error('Video not found');
      } else {
        var duration = body.items[0].contentDetails.duration;

        var parsedDuration = _moment["default"].duration(duration).format('s', {
          trim: false,
          useGrouping: false
        });

        res.status(200).send({
          duration: parsedDuration
        });
      }
    })["catch"](function (error) {
      console.log(error);
      return res.status(424).send('Video not found');
    });
  });
  var tranporter = (0, _authentication.generateTransporter)();
  (0, _authentication.checkLogin)(app, models);
  (0, _authentication.loginLink)(app, models, tranporter);
  (0, _authentication.login)(app, models);
  (0, _user.createUser)(app, models, checkAuth, checkAdmin);
  (0, _user.deleteUser)(app, models, checkAuth, checkAdmin);
  (0, _flower.createFlower)(app, models);
  (0, _flower.addNode)(app, models);
  (0, _flower.getNode)(app, models);
}