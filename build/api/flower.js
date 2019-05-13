"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.createFlower = createFlower;
exports.addNode = addNode;

var _check = require("express-validator/check");

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
    } else {
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
          models.Video.create({
            type: type,
            userId: user.get('id'),
            url: getVideoId(link).id
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
      });
    }
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
    sourceLength: {
      isInt: {
        errorMessage: 'SourceLength is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'SourceLength is empty'
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
          sourceLength = _req$body2.sourceLength,
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
          models.Video.create({
            type: type,
            userId: user.get('id'),
            url: getVideoId(link).id
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
                sourceLength: sourceLength,
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
      });
    }
  });
}