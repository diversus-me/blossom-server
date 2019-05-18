"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFlower = createFlower;
exports.addNode = addNode;

var _check = require("express-validator/check");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _moment = _interopRequireDefault(require("moment"));

var _momentDurationFormat = _interopRequireDefault(require("moment-duration-format"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

var getVideoId = require('get-video-id');

function createFlower(app, models) {
  app.post('/api/flower', (0, _check.checkSchema)({
    title: {
      isString: {
        errorMessage: 'Title is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Title is empty'
      }
    },
    description: {
      isString: {
        errorMessage: 'Description is not a string'
      }
    },
    type: {
      isString: {
        errorMessage: 'Type is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Type is empty'
      },
      custom: {
        options: function options(value) {
          return value === 'youtube';
        },
        errorMessage: 'Type is not supported'
      }
    },
    link: {
      isString: {
        errorMessage: 'Link is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Link is empty'
      },
      custom: {
        options: function options(value) {
          var _getVideoId = getVideoId(value),
              id = _getVideoId.id;

          return id;
        },
        errorMessage: 'Malformed link.'
      }
    }
  }), function (req, res) {
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      console.log(errors.array());
      return res.status(422).jsonp(errors.array());
    }

    var _req$body = req.body,
        title = _req$body.title,
        description = _req$body.description,
        type = _req$body.type,
        link = _req$body.link;
    models.User.findOne({
      where: {
        id: req.session.userID
      }
    }).then(function (user) {
      if (!user) {
        return res.status(404).send('User not found.');
      } else {
        var vidId = getVideoId(link).id;
        (0, _nodeFetch["default"])("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(vidId, "&key=").concat(process.env.YOUTUBE_API_KEY)).then(checkStatus).then(function (body) {
          console.log(body.items[0].contentDetails.duration);

          if (!body.items[0]) {
            throw Error('Video not found');
          } else {
            var duration = body.items[0].contentDetails.duration;

            var parsedDuration = _moment["default"].duration(duration).format('s', {
              trim: false,
              useGrouping: false
            });

            models.Video.create({
              type: type,
              userId: user.get('id'),
              url: vidId,
              duration: parsedDuration
            }).then(function (video) {
              models.Node.create({
                title: title,
                videoId: video.get('id'),
                userId: user.get('id'),
                created: new Date()
              }).then(function (node) {
                models.Flower.create({
                  title: title,
                  description: description,
                  userId: user.get('id'),
                  nodeId: node.get('id'),
                  created: new Date()
                }).then(function (flower) {
                  return res.status(200).send({
                    message: 'Flower was created'
                  });
                });
              });
            });
          }
        })["catch"](function () {
          return res.status(424).send('Video not found');
        });
      }
    });
  });
}

function addNode(app, models) {
  app.post('/api/node', (0, _check.checkSchema)({
    id: {
      isInt: {
        errorMessage: 'ID is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'ID not specified.'
      }
    },
    title: {
      isString: {
        errorMessage: 'Title is not a string.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Title not specified.'
      }
    },
    type: {
      isString: {
        errorMessage: 'Type is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Type is empty'
      },
      custom: {
        options: function options(value) {
          return value === 'youtube';
        },
        errorMessage: 'Type is not supported'
      }
    },
    link: {
      isString: {
        errorMessage: 'Link is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Link is empty'
      },
      custom: {
        options: function options(value) {
          var _getVideoId2 = getVideoId(value),
              id = _getVideoId2.id;

          return id;
        },
        errorMessage: 'Malformed link.'
      }
    },
    sourceIn: {
      isInt: {
        errorMessage: 'SourceIn is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'SourceIn is empty'
      }
    },
    sourceOut: {
      isInt: {
        errorMessage: 'SourceOut is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'SourceOut is empty'
      }
    },
    flavor: {
      isString: {
        errorMessage: 'Flavor is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Flavor is empty'
      }
    },
    targetIn: {
      isInt: {
        errorMessage: 'TargetIn is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'TargetIn is empty'
      }
    },
    targetOut: {
      isInt: {
        errorMessage: 'TargetOut is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'TargetOut is empty'
      }
    }
  }), function (req, res) {
    var errors = (0, _check.validationResult)(req);

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array());
    } else {
      var _req$body2 = req.body,
          id = _req$body2.id,
          title = _req$body2.title,
          type = _req$body2.type,
          link = _req$body2.link,
          sourceIn = _req$body2.sourceIn,
          sourceOut = _req$body2.sourceOut,
          targetIn = _req$body2.targetIn,
          targetOut = _req$body2.targetOut,
          flavor = _req$body2.flavor;
      models.User.findOne({
        where: {
          id: req.session.userID
        }
      }).then(function (user) {
        if (!user) {
          return res.status(404).send('User not found.');
        } else {
          var vidId = getVideoId(link).id;
          (0, _nodeFetch["default"])("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(vidId, "&key=").concat(process.env.YOUTUBE_API_KEY, "k")).then(checkStatus).then(function (body) {
            if (!body.items[0]) {
              throw Error('Video not found');
            } else {
              var duration = body.items[0].contentDetails.duration;

              var parsedDuration = _moment["default"].duration(duration).format('s', {
                trim: false,
                useGrouping: false
              });

              models.Video.create({
                type: type,
                userId: user.get('id'),
                url: vidId,
                duration: parsedDuration
              }).then(function (video) {
                models.Node.create({
                  title: title,
                  videoId: video.get('id'),
                  userId: user.get('id'),
                  created: new Date()
                }).then(function (node) {
                  models.Connection.create({
                    sourceIn: sourceIn,
                    sourceOut: sourceOut,
                    targetIn: targetIn,
                    targetOut: targetOut,
                    flavor: flavor,
                    userId: user.get('id'),
                    targetNodeId: node.get('id'),
                    nodeId: id,
                    created: new Date()
                  }).then(function (connection) {
                    return res.status(200).send({
                      message: 'Node was created'
                    });
                  });
                });
              });
            }
          })["catch"](function (error) {
            console.log(error);
            return res.status(424).send('Video not found');
          });
        }
      });
    }
  });
}

function checkStatus(res) {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    return res.json();
  } else {
    throw Error(res.statusText);
  }
}