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

import { Vimeo } from 'vimeo'
import multer from 'multer'
import fs from 'fs'
import FileReader from 'filereader'

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

  const client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_TOKEN)

  const upload = multer({
    limits: { fieldSize: 1024 * 1024 * 1024 }
  })

  app.post('/api/uploadLink', upload.single('video'), async (req, res) => {
    fs.writeFile(req.body.fileName, req.file.buffer, function (err) {
      if (err) {
        console.log('File Write:', err)
      } else {
        console.log('Successfully written File', err)
      }

      client.upload(
        req.body.fileName,
        function (uri) {
          console.log('File upload completed. Your Vimeo URI is:', uri)
          res.status(200).send({ uri })
        },
        function (bytesUploaded, bytesTotal) {
          var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        function (error) {
          console.log('Failed because: ' + error)
        }
      )
    })
  })
}
