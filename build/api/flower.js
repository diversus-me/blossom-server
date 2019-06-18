"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getFlowers = getFlowers;
exports.getNode = getNode;
exports.deleteFlower = deleteFlower;
exports.editFlower = editFlower;
exports.createFlower = createFlower;
exports.addNode = addNode;
exports.editNode = editNode;
exports.deleteNode = deleteNode;

var _check = require("express-validator/check");

var _nodeFetch = _interopRequireDefault(require("node-fetch"));

var _moment = _interopRequireDefault(require("moment"));

var _momentDurationFormat = _interopRequireDefault(require("moment-duration-format"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// eslint-disable-line no-unused-vars
const getVideoId = require('get-video-id');

function getFlowers(app, models) {
  app.get('/api/allFlowers', async (req, res) => {
    try {
      const flowers = await models.Flower.findAll({
        attributes: ['title', 'description', 'created', 'id'],
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
      return res.status(200).send({
        data: flowers
      });
    } catch (error) {
      return res.status(500).send('');
    }
  });
}

function getNode(app, models) {
  app.get('/api/node/:uid', async (req, res) => {
    try {
      const node = await models.Node.findOne({
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

      if (!node) {
        return res.status(404).send('Node not found.');
      }

      const connections = await node.getConnections({
        attributes: ['created', 'flavor', 'id', 'sourceIn', 'sourceOut', 'targetIn', 'targetOut'],
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

      if (!connections) {
        return res.status(405).send('Connections not found.');
      }

      return res.status(200).send({
        data: node,
        connections
      });
    } catch (error) {
      return res.status(500).send('');
    }
  });
}

function deleteFlower(app, models, checkAuth) {
  app.delete('/api/flower', checkAuth, (0, _check.checkSchema)({
    id: {
      isNumber: {
        errorMessage: 'id is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'id is empty'
      }
    }
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        id
      } = req.body;
      const flower = await models.Flower.findOne({
        where: {
          id
        }
      });

      if (!flower) {
        return res.status(404).send('Flower does not exist');
      }

      if (req.session.userID !== flower.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.');
      }

      const rowDeleted = await models.Flower.destroy({
        where: {
          id
        }
      });

      if (rowDeleted <= 0) {
        return res.status(409).send('Flower could not be deleted');
      }

      return res.status(200).send({
        message: 'Flower was deleted'
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send('');
    }
  });
}

function editFlower(app, models, checkAuth) {
  app.patch('/api/flower', checkAuth, (0, _check.checkSchema)({
    id: {
      isNumber: {
        errorMessage: 'id is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'id is empty'
      }
    },
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
    }
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        id,
        title,
        description
      } = req.body;
      const flower = await models.Flower.findOne({
        where: {
          id
        }
      });

      if (!flower) {
        return res.status(404).send('Flower does not exist');
      }

      if (req.session.userID !== flower.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.');
      }

      const updated = await flower.update({
        title,
        description
      });

      if (!updated) {
        return res.status(409).send('Flower could not be updated');
      }

      return res.status(200).send({
        message: 'Flower was updated'
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send('');
    }
  });
}

function createFlower(app, models, checkAuth) {
  app.post('/api/flower', checkAuth, (0, _check.checkSchema)({
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
        options: value => value === 'youtube',
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
        options: value => {
          const {
            id
          } = getVideoId(value);
          return id;
        },
        errorMessage: 'Malformed link.'
      }
    }
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        title,
        description,
        type,
        link
      } = req.body;
      const user = await models.User.findOne({
        where: {
          id: req.session.userID
        }
      });

      if (!user) {
        return res.status(404).send('User not found.');
      }

      const vidId = getVideoId(link).id;
      const response = await (0, _nodeFetch.default)(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`);
      const body = await checkStatus(response);

      if (!body.items[0]) {
        return res.status(422).send('Video not found');
      }

      const duration = body.items[0].contentDetails.duration;

      const parsedDuration = _moment.default.duration(duration).format('s', {
        trim: false,
        useGrouping: false
      });

      const video = await models.Video.create({
        type,
        userId: user.get('id'),
        url: vidId,
        duration: parsedDuration
      });
      const node = await models.Node.create({
        title,
        videoId: video.get('id'),
        userId: user.get('id'),
        created: new Date()
      });
      const flower = await models.Flower.create({
        title,
        description,
        userId: user.get('id'),
        nodeId: node.get('id'),
        created: new Date()
      });

      if (!flower) {
        return res.status(405).send('Flower was not created.');
      }

      return res.status(200).send({
        message: 'Flower was created'
      });
    } catch (error) {
      console.log(error);
      return res.status(500).send('');
    }
  });
}

function addNode(app, models, checkAuth) {
  app.post('/api/node', checkAuth, (0, _check.checkSchema)({
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
        options: value => value === 'youtube',
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
        options: value => {
          const {
            id
          } = getVideoId(value);
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
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        id,
        title,
        type,
        link,
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor
      } = req.body;
      const user = await models.User.findOne({
        where: {
          id: req.session.userID
        }
      });

      if (!user) {
        return res.status(404).send('User not found.');
      }

      const vidId = getVideoId(link).id;
      const response = await (0, _nodeFetch.default)(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`);
      const body = await checkStatus(response);

      if (!body.items[0]) {
        return res.status(422).send('Video not found');
      }

      const duration = body.items[0].contentDetails.duration;

      const parsedDuration = _moment.default.duration(duration).format('s', {
        trim: false,
        useGrouping: false
      });

      const video = await models.Video.create({
        type,
        userId: user.get('id'),
        url: vidId,
        duration: parsedDuration
      });
      const node = await models.Node.create({
        title,
        videoId: video.get('id'),
        userId: user.get('id'),
        created: new Date()
      });
      const connection = await models.Connection.create({
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor,
        userId: user.get('id'),
        targetNodeId: node.get('id'),
        nodeId: id,
        created: new Date()
      });

      if (!connection) {
        return res.status(500).send('Connection could not be created');
      }

      return res.status(200).send({
        message: 'Node was created'
      });
    } catch (errors) {
      return res.status(500).send('');
    }
  });
}

function editNode(app, models, checkAuth) {
  app.patch('/api/node', checkAuth, (0, _check.checkSchema)({
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
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        id,
        title,
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor
      } = req.body;
      console.log(id);
      const node = await models.Node.findOne({
        where: {
          id
        }
      });

      if (!node) {
        return res.status(404).send('Node does not exist');
      }

      if (req.session.userID !== node.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.');
      }

      const nodeUpdated = await node.update({
        title
      });

      if (!nodeUpdated) {
        return res.status(500).send('Node could not be updated');
      }

      console.log(id);
      const connection = await models.Connection.findOne({
        where: {
          targetNodeId: id
        }
      });
      console.log(connection);

      if (!connection) {
        return res.status(404).send('Connection does not exist');
      }

      const connectionUpdated = await connection.update({
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor
      });

      if (!connectionUpdated) {
        return res.status(500).send('Connection could not be updated');
      }

      return res.status(200).send({
        message: 'Node was updated'
      });
    } catch (errors) {
      console.log(errors);
      return res.status(500).send('');
    }
  });
}

function deleteNode(app, models, checkAuth) {
  app.delete('/api/node', checkAuth, (0, _check.checkSchema)({
    id: {
      isInt: {
        errorMessage: 'ID is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'ID not specified.'
      }
    }
  }), async (req, res) => {
    try {
      const errors = (0, _check.validationResult)(req);

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array());
      }

      const {
        id
      } = req.body;
      const node = await models.Node.findOne({
        where: {
          id
        }
      });

      if (!node) {
        return res.status(404).send('Flower does not exist');
      }

      if (req.session.userID !== node.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.');
      }

      const connectionUpdated = await models.Connection.destroy({
        where: {
          targetNodeId: id
        }
      });

      if (connectionUpdated <= 0) {
        return res.status(500).send('Connection could not be updated');
      }

      const nodeDeleted = await models.Node.destroy({
        where: {
          id
        }
      });

      if (nodeDeleted <= 0) {
        return res.status(500).send('Node could not be updated');
      }

      return res.status(200).send({
        message: 'Node was updated'
      });
    } catch (errors) {
      return res.status(500).send('');
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