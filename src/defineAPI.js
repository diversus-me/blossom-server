import { createUser, deleteUser } from './api/user'
import { loginLink, login, checkLogin, generateTransporter } from './api/authentication'
import { createFlower, addNode } from './api/flower'
import fetch from 'node-fetch'
import moment from 'moment'
const getVideoId = require('get-video-id')

function checkAuth (req, res, next) {
  if (req.session.authenticated) {
    next()
  }
  return res.status(403)
}

function checkAdmin (req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    console.log('req.session.role')
    next()
  }
  return res.status(403)
}

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res.json()
  } else {
    throw Error('Connection Fail')
  }
}

export default function defineAPI (app, models) {
  app.get('/api/allFlowers', (req, res) => {
    models.Flower.findAll({
      attributes: [
        'title', 'description', 'created'
      ],
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
      .then((flowers) => {
        return res.status(200).send({ data: flowers })
      })
  })

  app.get('/api/videoLength', (req, res) => {
    const vidId = getVideoId(req.query.videolink).id
    if (!vidId) {
      return res.status(424).send('Video not found')
    }

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(checkStatus)
      .then(body => {
        if (!body.items[0]) {
          throw Error('Video not found')
        } else {
          const duration = body.items[0].contentDetails.duration
          const parsedDuration = moment.duration(duration).format('s', { trim: false, useGrouping: false })
          res.status(200).send({ duration: parsedDuration })
        }
      })
      .catch(() => res.status(424).send('Video not found'))
  })

  // app.get('/api/allFlowers', (req, res) => {
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

  const tranporter = generateTransporter()

  checkLogin(app, models)
  loginLink(app, models, tranporter)
  login(app, models)

  createUser(app, models, checkAuth, checkAdmin)
  deleteUser(app, models, checkAuth, checkAdmin)

  createFlower(app, models)
  addNode(app, models)

  app.get('/api/node/:uid', (req, res) => {
    models.Node.findOne({
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
      .then((node) => {
        if (!node) {
          return res.status(404).send('Node not found.')
        }
        node.getConnections({
          attributes: [
            'created', 'flavor', 'id', 'sourceIn', 'sourceOut'
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
          .then((connections) => {
            if (!connections) {
              return res.status(405).send('Connections not found.')
            }
            return res.status(200).send({ data: node, connections })
          })
      })
  })
}
