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

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

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
    // res.status >= 200 && res.status < 300
    return res.json();
  } else {
    throw Error('Connection Fail');
  }
}

function defineAPI(app, models) {
  app.get('/api/allFlowers', function (req, res) {
    models.Flower.findAll({
      attributes: ['title', 'description', 'created'],
      include: [{
        model: models.User,
        attributes: ['id', 'name']
      }, {
        model: models.Node,
        attributes: ['id'],
        include: [{
          model: models.Video,
          attributes: ['url', 'type', 'uploaded', 'duration']
        }]
      }]
    }).then(function (flowers) {
      return res.status(200).send({
        data: flowers
      });
    });
  });
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
    })["catch"](function () {
      return res.status(424).send('Video not found');
    });
  }); // app.get('/api/allFlowers', (req, res) => {
  //   models.User.findOne({
  //     where : {
  //       id: req.session.userID
  //     },
  //     // include: [{
  //     //   model: models.User,
  //     //   attributes: ['id', 'name']
  //     // }]
  //   })
  //   .then((user) => {
  //     user.getFlowers({
  //       attributes: [
  //         'id', 'title', 'description', 'created'
  //       ],
  //     }).then((flowers) => {
  //       console.log(flowers)
  //       return res.status(200).send({data:flowers})
  //     })
  //   })
  // })

  (0, _authentication.checkLogin)(app, models);
  (0, _authentication.loginLink)(app, models);
  (0, _authentication.login)(app, models);
  (0, _user.createUser)(app, models, checkAuth, checkAdmin);
  (0, _user.deleteUser)(app, models, checkAuth, checkAdmin);
  (0, _flower.createFlower)(app, models);
  (0, _flower.addNode)(app, models);
  app.get('/api/node/:uid', function (req, res) {
    models.Node.findOne({
      where: {
        id: req.params.uid
      },
      attributes: ['id', 'title', 'created'],
      include: [{
        model: models.User,
        attributes: ['id', 'name']
      }, {
        model: models.Video,
        attributes: ['url', 'type', 'uploaded', 'duration']
      }]
    }).then(function (node) {
      if (!node) {
        return res.status(404).send('Node not found.');
      }

      node.getConnections({
        attributes: ['created', 'flavor', 'id', 'sourceIn', 'sourceOut'],
        include: [{
          model: models.Node,
          as: 'targetNode',
          attributes: ['id', 'created', 'title'],
          include: [{
            model: models.Video,
            attributes: ['url', 'type', 'uploaded', 'duration']
          }]
        }, {
          model: models.User,
          attributes: ['id', 'name']
        }]
      }).then(function (connections) {
        if (!connections) {
          return res.status(405).send('Connections not found.');
        }

        return res.status(200).send({
          data: node,
          connections: connections
        });
      });
    });
  });
}