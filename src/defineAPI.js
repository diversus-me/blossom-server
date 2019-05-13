import { createUser, deleteUser } from './api/user'
import { loginLink, login, checkLogin } from './api/authentication'
import { createFlower, addNode } from './api/flower'

function checkAuth(req, res, next) {
  if (req.session.authenticated) {
    next()
  }
  return res.status(403)
}

function checkAdmin(req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    console.log('req.session.role')
    next()
  }
  return res.status(403)
}

export default function defineAPI(app, models) {

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
              attributes: ['url', 'type']
            }]
          }
        ],
        })
        .then((flowers) => {
          return res.status(200).send({data:flowers})
        })
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
      
      checkLogin(app, models)
      loginLink(app, models)
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
            attributes: ['url', 'type', 'uploaded']
          }]
        })
        .then((node) => {
          if (!node) {
            return res.status(404).send('Node not found.')
          }
          node.getConnections({
            attributes: [
              'created', 'flavor', 'id', 'sourceIn', 'sourceOut', 'sourceLength'
            ],
            include: [{
              model: models.Node,
              as: 'targetNode',
              attributes: ['id', 'created', 'title'],
              include: [{
                model: models.Video,
                attributes: ['url', 'type', 'uploaded']
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
            return res.status(200).send({data: node, connections})
          })
        })
      })

}