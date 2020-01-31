// import { createUser, deleteUser, getUsers } from './api/user'
import { checkLogin, checkToken, checkAdmin } from './api/authentication'
import {
  createFlower, addNode, getFlowers, deleteFlower, getNode,
  editNode, editFlower, deleteNode
} from './api/flower'
import { uploadVideo } from './api/video'

export default function defineAPI (app, models) {
  app.get('/api/test', checkToken, checkAdmin,
    async (req, res) => {
      console.log(req.token)
      res.send(200)
    }
  )

  getFlowers(app, models)
  uploadVideo(app)

  checkLogin(app)

  // getUsers(app, models, checkToken, checkAdmin)
  // createUser(app, models, checkToken, checkAdmin)
  // deleteUser(app, models, checkToken, checkAdmin)

  createFlower(app, models, checkToken)
  deleteFlower(app, models, checkToken)
  editFlower(app, models, checkToken)
  addNode(app, models, checkToken)
  getNode(app, models)
  editNode(app, models, checkToken)
  deleteNode(app, models, checkToken)
}
