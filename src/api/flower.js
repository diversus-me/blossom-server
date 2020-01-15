import { checkSchema, validationResult } from 'express-validator/check'
import fetch from 'node-fetch'
import Sequelize from 'sequelize'
import moment from 'moment'
import momentDurationFormat from 'moment-duration-format' // eslint-disable-line no-unused-vars
const getVideoId = require('get-video-id')

export function getFlowers (app, models) {
  app.get('/api/allFlowers', async (req, res) => {
    try {
      const flowers = await models.Flower.findAll({
        attributes: ['title', 'description', 'created', 'id'],
        include: [{
          model: models.User,
          attributes: ['id', 'name']
        },
        {
          model: models.Node,
          attributes: ['id'],
          include: [{
            model: models.Video,
            attributes: ['url', 'type', 'uploaded', 'duration']
          }]
        }
        ]
      })
      // const node = await models.Connection.findAll({
      //   where: {
      //     id: req.params.uid
      //   },
      //   attributes: [
      //     'created', 'flavor', 'id', 'sourceIn', 'sourceOut', 'targetIn', 'targetOut'
      //   ]
      // })

      return res.status(200).send({ data: flowers })
    } catch (error) {
      console.log(error)
      return res.status(500).send('')
    }
  })
}

export function getNode (app, models) {
  app.get('/api/node/:uid', async (req, res) => {
    try {
      const node = await models.Node.findOne({
        where: {
          id: req.params.uid
        },
        attributes: [
          'id', 'title', 'created'
        ],
        include: [{
          model: models.User,
          attributes: ['id', 'name']
        },
        {
          model: models.Video,
          attributes: ['url', 'type', 'uploaded', 'duration']
        }]
      })

      if (!node) {
        return res.status(404).send('Node not found.')
      }

      const connections = await node.getConnections({
        attributes: [
          'created', 'flavor', 'id', 'sourceIn', 'sourceOut', 'targetIn', 'targetOut'
        ],
        include: [{
          model: models.Node,
          as: 'targetNode',
          attributes: ['id', 'created', 'title'],
          include: [{
            model: models.Video,
            attributes: ['url', 'type', 'uploaded', 'duration']
          }]
        },
        {
          model: models.User,
          attributes: ['id', 'name']
        }]
      })

      if (!connections) {
        return res.status(405).send('Connections not found.')
      }

      return res.status(200).send({ data: node, connections })
    } catch (error) {
      return res.status(500).send('')
    }
  })
}

export function deleteFlower (app, models, checkAuth) {
  app.delete('/api/flower', checkAuth, checkSchema({
    id: {
      isNumeric: {
        errorMessage: 'id is not a number'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'id is empty'
      }
    }
  }), async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { id } = req.body
      const flower = await models.Flower.findOne({
        where: {
          id
        }
      })

      if (!flower) {
        return res.status(404).send('Flower does not exist')
      }

      if (req.session.userID !== flower.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.')
      }

      const rowDeleted = await models.Flower.destroy({
        where: {
          id
        }
      })

      if (rowDeleted <= 0) {
        return res.status(409).send('Flower could not be deleted')
      }

      return res.status(200).send({ message: 'Flower was deleted' })
    } catch (error) {
      return res.status(500).send('')
    }
  })
}

export function editFlower (app, models, checkAuth) {
  app.patch('/api/flower', checkAuth, checkSchema({
    id: {
      isNumeric: {
        errorMessage: 'id is not a number'
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
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { id, title, description } = req.body
      const flower = await models.Flower.findOne({
        where: {
          id
        }
      })

      if (!flower) {
        return res.status(404).send('Flower does not exist')
      }

      if (req.session.userID !== flower.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.')
      }

      const updated = await flower.update({
        title, description
      })

      if (!updated) {
        return res.status(409).send('Flower could not be updated')
      }

      return res.status(200).send({ message: 'Flower was updated' })
    } catch (error) {
      console.log(error)
      return res.status(500).send('')
    }
  })
}

export function createFlower (app, models, checkAuth) {
  app.post('/api/flower', checkSchema({
    title: {
      isString: {
        errorMessage: 'Title is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Title is empty'
      }
    },
    duration: {
      isInt: {
        errorMessage: 'Duration is not a integer'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'duration is empty'
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
        options: value => (value === 'vimeo'),
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
        options: (value) => {
          const { id } = getVideoId(value)
          return id
        },
        errorMessage: 'Malformed link.'
      }
    }
  }), async (req, res) => {
    try {
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { title, description, type, link, duration } = req.body
      const user = await models.User.findOne({
        where: {
          id: 1
        }
      })
      if (!user) {
        return res.status(404).send('User not found.')
      }

      // const vidId = getVideoId(link).id
      // const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`)
      // const body = await checkStatus(response)

      // if (!body.items[0]) {
      //   return res.status(422).send('Video not found')
      // }
      const vidId = getVideoId(link).id
      // const response = await fetch('http://vimeo.com/api/v2/video/' + vidId + '.json')
      // const json = await response.json()

      // const duration = json[0].duration
      const video = await models.Video.create({
        type,
        userId: user.get('id'),
        url: vidId,
        duration
      })

      const node = await models.Node.create({
        title,
        description,
        videoId: video.get('id'),
        userId: user.get('id'),
        created: new Date()
      })

      const flower = await models.Flower.create({
        title,
        description,
        userId: user.get('id'),
        nodeId: node.get('id'),
        created: new Date()
      })

      if (!flower) {
        return res.status(405).send('Flower was not created.')
      }

      return res.status(200).send({ message: 'Flower was created' })
    } catch (error) {
      console.log(error)
      return res.status(500).send('')
    }
  })
}

export function addNode (app, models, checkAuth) {
  app.post('/api/node', checkAuth, checkSchema({
    id: {
      isInt: {
        errorMessage: 'ID is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'ID not specified.'
      }
    },
    duration: {
      isInt: {
        errorMessage: 'Duration is not a integer'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'duration is empty'
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
    description: {
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
        options: value => (value === 'vimeo'),
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
        options: (value) => {
          const { id } = getVideoId(value)
          return id
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
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { id, title, description, duration, type, link, sourceIn, sourceOut, targetIn, targetOut, flavor } = req.body

      const user = await models.User.findOne({
        where: {
          id: req.session.userID
        }
      })

      if (!user) {
        return res.status(404).send('User not found.')
      }

      const vidId = getVideoId(link).id
      // const response = await fetch('http://vimeo.com/api/v2/video/' + vidId + '.json')
      // const json = await response.json()

      // const duration = json[0].duration
      const video = await models.Video.create({
        type,
        userId: user.get('id'),
        url: vidId,
        duration
      })

      const node = await models.Node.create({
        title,
        description,
        videoId: video.get('id'),
        userId: user.get('id'),
        created: new Date()
      })

      const connection = await models.Connection.create({
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor,
        claps: 0,
        userId: user.get('id'),
        targetNodeId: node.get('id'),
        nodeId: id,
        created: new Date()
      })

      if (!connection) {
        return res.status(500).send('Connection could not be created')
      }

      return res.status(200).send({ message: 'Node was created' })
    } catch (errors) {
      console.log(errors)
      return res.status(500).send('')
    }
  })
}

export function editNode (app, models, checkAuth) {
  app.patch('/api/node', checkAuth, checkSchema({
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
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { id, title, sourceIn, sourceOut, targetIn, targetOut, flavor } = req.body
      console.log(id)
      const node = await models.Node.findOne({
        where: {
          id
        }
      })

      if (!node) {
        return res.status(404).send('Node does not exist')
      }

      if (req.session.userID !== node.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.')
      }

      const nodeUpdated = await node.update({
        title
      })

      if (!nodeUpdated) {
        return res.status(500).send('Node could not be updated')
      }
      console.log(id)
      const connection = await models.Connection.findOne({
        where: {
          targetNodeId: id
        }
      })
      console.log(connection)
      if (!connection) {
        return res.status(404).send('Connection does not exist')
      }

      const connectionUpdated = await connection.update({
        sourceIn,
        sourceOut,
        targetIn,
        targetOut,
        flavor
      })

      if (!connectionUpdated) {
        return res.status(500).send('Connection could not be updated')
      }

      return res.status(200).send({ message: 'Node was updated' })
    } catch (errors) {
      console.log(errors)
      return res.status(500).send('')
    }
  })
}

export function deleteNode (app, models, checkAuth) {
  app.delete('/api/node', checkAuth, checkSchema({
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
      const errors = validationResult(req)

      if (!errors.isEmpty()) {
        return res.status(422).jsonp(errors.array())
      }

      const { id } = req.body

      const node = await models.Node.findOne({
        where: {
          id
        }
      })

      if (!node) {
        return res.status(404).send('Flower does not exist')
      }

      if (req.session.userID !== node.get('userId') && req.session.role !== 'admin') {
        return res.status(403).send('Not allowed.')
      }

      const connectionUpdated = await models.Connection.destroy({
        where: {
          targetNodeId: id
        }
      })

      if (connectionUpdated <= 0) {
        return res.status(500).send('Connection could not be updated')
      }

      const nodeDeleted = await models.Node.destroy({
        where: {
          id
        }
      })

      if (nodeDeleted <= 0) {
        return res.status(500).send('Node could not be updated')
      }

      return res.status(200).send({ message: 'Node was updated' })
    } catch (errors) {
      return res.status(500).send('')
    }
  })
}

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res.json()
  } else {
    throw Error(res.statusText)
  }
}
