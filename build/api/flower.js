"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlowers = getFlowers;
exports.getNode = getNode;
exports.createFlower = createFlower;
exports.addNode = addNode;

var _check = require("express-validator/check");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _moment = _interopRequireDefault(require("moment"));

var _momentDurationFormat = _interopRequireDefault(require("moment-duration-format"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

// eslint-disable-line no-unused-vars
var getVideoId = require('get-video-id');

function getFlowers(app, models) {
  app.get('/api/allFlowers',
  /*#__PURE__*/
  function () {
    var _ref = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee(req, res) {
      var flowers;
      return regeneratorRuntime.wrap(function _callee$(_context) {
        while (1) {
          switch (_context.prev = _context.next) {
            case 0:
              _context.prev = 0;
              _context.next = 3;
              return models.Flower.findAll({
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
              });

            case 3:
              flowers = _context.sent;
              return _context.abrupt("return", res.status(200).send({
                data: flowers
              }));

            case 7:
              _context.prev = 7;
              _context.t0 = _context["catch"](0);
              return _context.abrupt("return", res.status(500).send(''));

            case 10:
            case "end":
              return _context.stop();
          }
        }
      }, _callee, null, [[0, 7]]);
    }));

    return function (_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }());
}

function getNode(app, models) {
  app.get('/api/node/:uid',
  /*#__PURE__*/
  function () {
    var _ref2 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee2(req, res) {
      var node, connections;
      return regeneratorRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch (_context2.prev = _context2.next) {
            case 0:
              _context2.prev = 0;
              _context2.next = 3;
              return models.Node.findOne({
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
              });

            case 3:
              node = _context2.sent;

              if (node) {
                _context2.next = 6;
                break;
              }

              return _context2.abrupt("return", res.status(404).send('Node not found.'));

            case 6:
              _context2.next = 8;
              return node.getConnections({
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
              });

            case 8:
              connections = _context2.sent;

              if (connections) {
                _context2.next = 11;
                break;
              }

              return _context2.abrupt("return", res.status(405).send('Connections not found.'));

            case 11:
              return _context2.abrupt("return", res.status(200).send({
                data: node,
                connections: connections
              }));

            case 14:
              _context2.prev = 14;
              _context2.t0 = _context2["catch"](0);
              return _context2.abrupt("return", res.status(500).send(''));

            case 17:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2, null, [[0, 14]]);
    }));

    return function (_x3, _x4) {
      return _ref2.apply(this, arguments);
    };
  }());
}

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
  }),
  /*#__PURE__*/
  function () {
    var _ref3 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee3(req, res) {
      var errors, _req$body, title, description, type, link, user, vidId, response, body, duration, parsedDuration, video, node, flower;

      return regeneratorRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch (_context3.prev = _context3.next) {
            case 0:
              _context3.prev = 0;
              errors = (0, _check.validationResult)(req);

              if (errors.isEmpty()) {
                _context3.next = 4;
                break;
              }

              return _context3.abrupt("return", res.status(422).jsonp(errors.array()));

            case 4:
              _req$body = req.body, title = _req$body.title, description = _req$body.description, type = _req$body.type, link = _req$body.link;
              _context3.next = 7;
              return models.User.findOne({
                where: {
                  id: req.session.userID
                }
              });

            case 7:
              user = _context3.sent;

              if (user) {
                _context3.next = 10;
                break;
              }

              return _context3.abrupt("return", res.status(404).send('User not found.'));

            case 10:
              vidId = getVideoId(link).id;
              _context3.next = 13;
              return (0, _nodeFetch["default"])("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(vidId, "&key=").concat(process.env.YOUTUBE_API_KEY));

            case 13:
              response = _context3.sent;
              _context3.next = 16;
              return checkStatus(response);

            case 16:
              body = _context3.sent;

              if (body.items[0]) {
                _context3.next = 19;
                break;
              }

              return _context3.abrupt("return", res.status(422).send('Video not found'));

            case 19:
              duration = body.items[0].contentDetails.duration;
              parsedDuration = _moment["default"].duration(duration).format('s', {
                trim: false,
                useGrouping: false
              });
              _context3.next = 23;
              return models.Video.create({
                type: type,
                userId: user.get('id'),
                url: vidId,
                duration: parsedDuration
              });

            case 23:
              video = _context3.sent;
              _context3.next = 26;
              return models.Node.create({
                title: title,
                videoId: video.get('id'),
                userId: user.get('id'),
                created: new Date()
              });

            case 26:
              node = _context3.sent;
              _context3.next = 29;
              return models.Flower.create({
                title: title,
                description: description,
                userId: user.get('id'),
                nodeId: node.get('id'),
                created: new Date()
              });

            case 29:
              flower = _context3.sent;

              if (flower) {
                _context3.next = 32;
                break;
              }

              return _context3.abrupt("return", res.status(405).send('Flower was not created.'));

            case 32:
              return _context3.abrupt("return", res.status(200).send({
                message: 'Flower was created'
              }));

            case 35:
              _context3.prev = 35;
              _context3.t0 = _context3["catch"](0);
              console.log(_context3.t0);
              return _context3.abrupt("return", res.status(500).send(''));

            case 39:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3, null, [[0, 35]]);
    }));

    return function (_x5, _x6) {
      return _ref3.apply(this, arguments);
    };
  }());
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
  }),
  /*#__PURE__*/
  function () {
    var _ref4 = _asyncToGenerator(
    /*#__PURE__*/
    regeneratorRuntime.mark(function _callee4(req, res) {
      var errors, _req$body2, id, title, type, link, sourceIn, sourceOut, targetIn, targetOut, flavor, user, vidId, response, body, duration, parsedDuration, video, node, connection;

      return regeneratorRuntime.wrap(function _callee4$(_context4) {
        while (1) {
          switch (_context4.prev = _context4.next) {
            case 0:
              _context4.prev = 0;
              errors = (0, _check.validationResult)(req);

              if (errors.isEmpty()) {
                _context4.next = 4;
                break;
              }

              return _context4.abrupt("return", res.status(422).jsonp(errors.array()));

            case 4:
              _req$body2 = req.body, id = _req$body2.id, title = _req$body2.title, type = _req$body2.type, link = _req$body2.link, sourceIn = _req$body2.sourceIn, sourceOut = _req$body2.sourceOut, targetIn = _req$body2.targetIn, targetOut = _req$body2.targetOut, flavor = _req$body2.flavor;
              _context4.next = 7;
              return models.User.findOne({
                where: {
                  id: req.session.userID
                }
              });

            case 7:
              user = _context4.sent;

              if (user) {
                _context4.next = 10;
                break;
              }

              return _context4.abrupt("return", res.status(404).send('User not found.'));

            case 10:
              vidId = getVideoId(link).id;
              _context4.next = 13;
              return (0, _nodeFetch["default"])("https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=".concat(vidId, "&key=").concat(process.env.YOUTUBE_API_KEY));

            case 13:
              response = _context4.sent;
              _context4.next = 16;
              return checkStatus(response);

            case 16:
              body = _context4.sent;

              if (body.items[0]) {
                _context4.next = 19;
                break;
              }

              return _context4.abrupt("return", res.status(422).send('Video not found'));

            case 19:
              duration = body.items[0].contentDetails.duration;
              parsedDuration = _moment["default"].duration(duration).format('s', {
                trim: false,
                useGrouping: false
              });
              _context4.next = 23;
              return models.Video.create({
                type: type,
                userId: user.get('id'),
                url: vidId,
                duration: parsedDuration
              });

            case 23:
              video = _context4.sent;
              _context4.next = 26;
              return models.Node.create({
                title: title,
                videoId: video.get('id'),
                userId: user.get('id'),
                created: new Date()
              });

            case 26:
              node = _context4.sent;
              _context4.next = 29;
              return models.Connection.create({
                sourceIn: sourceIn,
                sourceOut: sourceOut,
                targetIn: targetIn,
                targetOut: targetOut,
                flavor: flavor,
                userId: user.get('id'),
                targetNodeId: node.get('id'),
                nodeId: id,
                created: new Date()
              });

            case 29:
              connection = _context4.sent;

              if (connection) {
                _context4.next = 32;
                break;
              }

              return _context4.abrupt("return", res.status(500).send('Connection could not be created'));

            case 32:
              return _context4.abrupt("return", res.status(200).send({
                message: 'Node was created'
              }));

            case 35:
              _context4.prev = 35;
              _context4.t0 = _context4["catch"](0);
              return _context4.abrupt("return", res.status(500).send(''));

            case 38:
            case "end":
              return _context4.stop();
          }
        }
      }, _callee4, null, [[0, 35]]);
    }));

    return function (_x7, _x8) {
      return _ref4.apply(this, arguments);
    };
  }());
}

function checkStatus(res) {
  if (res.ok) {
    // res.status >= 200 && res.status < 300
    return res.json();
  } else {
    throw Error(res.statusText);
  }
}