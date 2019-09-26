import companion from '@uppy/companion'
import shortid from 'shortid'

shortid.seed(process.env.IDSEED)

function checkVideoID (models) {
  return async (req, res, next) => {
    try {
      const user = await models.User.findOne({
        where: {
          id: req.query.filename.split('.')[0]
        }
      })

      if (!user) {
        return res.status(404).send('User not found.')
      }

      const video = await models.Video.findOne({
        where: {
          id: req.query.filename.split('.')[1],
          duration: 0
        }
      })

      if (!video) {
        return res.status(404).send('Video not found.')
      }

      req.videoURL = video.get('url')
      req.filetype = req.query.filename.split('.')[2]
      next()
    } catch (error) {
      res.status(500).send()
    }
  }
}

export function uppyRequest (app, models, checkAuth) {
  app.get('/api/requestUppy', checkAuth, async (req, res, next) => {
    try {
      const user = await models.User.findOne({
        where: {
          id: req.session.userID
        }
      })

      if (!user) {
        return res.status(404).send('User not found.')
      }

      const video = await models.Video.create({
        type: 'native',
        userId: user.get('id'),
        url: shortid.generate(),
        duration: 0
      })

      const videoID = video.get('id')

      return res.status(200).send({ videoID })
    } catch (errors) {
      console.log(errors)
      return res.status(500).send('')
    }
  })
}

export function uppyCompanion (app, models, checkAuth) {
  const options = {
    providerOptions: {
      server: {
        path: '/uppy'
      },
      s3: {
        getKey: (req, filename) =>
          `upload/${filename}`,
        key: process.env.COMPANION_AWS_KEY,
        secret: process.env.COMPANION_AWS_SECRET,
        bucket: process.env.COMPANION_AWS_BUCKET,
        region: process.env.COMPANION_AWS_REGION
      }
    },
    server: {
      host: process.env.HOST,
      protocol: (process.env.NODE_ENV !== 'production') ? 'http' : 'https'
    },
    //   sendSelfEndpoint: 'localhost:3020',
    secret: process.env.COMPANION_SECRET,
    debug: true
  }

  // app.use('/uppy', checkAuth)
  // app.use('/uppy', checkVideoID(models))
  app.use('/uppy', companion.app(options))
}

export function confirmVideoConversion (app, models) {
  app.post('/confirmVideoConversion', (req, res) => {
    console.log(req.headers.origin)
    return res.status(200).send()
  })
}
