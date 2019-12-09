import { createUser, deleteUser, getUsers } from './api/user'
import {
  loginLink, login, checkLogin,
  generateTransporter, logout
} from './api/authentication'
import {
  createFlower, addNode, getFlowers, deleteFlower, getNode,
  editNode, editFlower, deleteNode
} from './api/flower'
import { getVideoMeta, uploadVideo } from './api/video'

function checkAuth (req, res, next) {
  if (req.session.authenticated) {
    next()
  } else {
    return res.status(403).send()
  }
}

function checkAdmin (req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    next()
  } else {
    return res.status(403).send()
  }
}

export default function defineAPI (app, models) {
  getFlowers(app, models)
  getVideoMeta(app, models)
  uploadVideo(app)

  const tranporter = generateTransporter()
  checkLogin(app, models)
  loginLink(app, models, tranporter)
  login(app, models)
  logout(app, models)

  getUsers(app, models, checkAuth, checkAdmin)
  createUser(app, models, checkAuth, checkAdmin)
  deleteUser(app, models, checkAuth, checkAdmin)

  createFlower(app, models, checkAuth)
  deleteFlower(app, models, checkAuth)
  editFlower(app, models, checkAuth)
  addNode(app, models, checkAuth)
  getNode(app, models)
  editNode(app, models, checkAuth)
  deleteNode(app, models, checkAuth)
}
