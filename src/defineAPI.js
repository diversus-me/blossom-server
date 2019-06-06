import { createUser, deleteUser } from './api/user'
import { loginLink, login, checkLogin, generateTransporter } from './api/authentication'
import { createFlower, addNode, getFlowers, getNode } from './api/flower'
import { getVideoLength } from './api/video'

function checkAuth (req, res, next) {
  if (req.session.authenticated) {
    next()
  }
  return res.status(403)
}

function checkAdmin (req, res, next) {
  if (req.session.role && req.session.role === 'admin') {
    next()
  }
  return res.status(403)
}

export default function defineAPI (app, models) {
  getFlowers(app, models)
  getVideoLength(app, models)

  const tranporter = generateTransporter()
  checkLogin(app, models)
  loginLink(app, models, tranporter)
  login(app, models)

  createUser(app, models, checkAuth, checkAdmin)
  deleteUser(app, models, checkAuth, checkAdmin)

  createFlower(app, models, checkAuth)
  addNode(app, models, checkAuth)
  getNode(app, models)
}
