import { createUser, deleteUser, getUsers } from './api/user'
import {
  loginLink, login, checkLogin,
  generateTransporter, logout
} from './api/authentication'
import {
  createFlower, addNode, getFlowers, deleteFlower, getNode,
  editNode, editFlower, deleteNode
} from './api/flower'
import { getVideoMeta } from './api/video'
import { uppyCompanion, uppyRequest, confirmVideoConversion } from './uppy'
// import { getPresignedUploadUrl } from './s3/s3'

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
  getVideoMeta(app, models)

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

  uppyCompanion(app, models, checkAuth)
  uppyRequest(app, models, checkAuth)
  confirmVideoConversion(app, models)
  // app.get('/api/uploadLink', async (req, res) => {
  //   try {
  //     const url = await getPresignedUploadUrl(`testfile${Math.random() * 1000}00`)
  //     res.status(200).send({ url })
  //   } catch (error) {
  //     console.log(error)
  //   }
  // })
}
