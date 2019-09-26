"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.uppyRequest = uppyRequest;
exports.uppyCompanion = uppyCompanion;
exports.confirmVideoConversion = confirmVideoConversion;

var _companion = _interopRequireDefault(require("@uppy/companion"));

var _shortid = _interopRequireDefault(require("shortid"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

_shortid.default.seed(process.env.IDSEED);

function checkVideoID(models) {
  return async (req, res, next) => {
    try {
      const user = await models.User.findOne({
        where: {
          id: req.query.filename.split('.')[0]
        }
      });

      if (!user) {
        return res.status(404).send('User not found.');
      }

      const video = await models.Video.findOne({
        where: {
          id: req.query.filename.split('.')[1],
          duration: 0
        }
      });

      if (!video) {
        return res.status(404).send('Video not found.');
      }

      req.videoURL = video.get('url');
      req.filetype = req.query.filename.split('.')[2];
      next();
    } catch (error) {
      res.status(500).send();
    }
  };
}

function uppyRequest(app, models, checkAuth) {
  app.get('/api/requestUppy', checkAuth, async (req, res, next) => {
    try {
      const user = await models.User.findOne({
        where: {
          id: req.session.userID
        }
      });

      if (!user) {
        return res.status(404).send('User not found.');
      }

      const video = await models.Video.create({
        type: 'native',
        userId: user.get('id'),
        url: _shortid.default.generate(),
        duration: 0
      });
      const videoID = video.get('id');
      return res.status(200).send({
        videoID
      });
    } catch (errors) {
      console.log(errors);
      return res.status(500).send('');
    }
  });
}

function uppyCompanion(app, models, checkAuth) {
  const options = {
    providerOptions: {
      server: {
        path: '/uppy'
      },
      s3: {
        getKey: (req, filename) => `upload/${filename}`,
        key: process.env.COMPANION_AWS_KEY,
        secret: process.env.COMPANION_AWS_SECRET,
        bucket: process.env.COMPANION_AWS_BUCKET,
        region: process.env.COMPANION_AWS_REGION
      }
    },
    server: {
      host: process.env.HOST,
      protocol: process.env.NODE_ENV !== 'production' ? 'http' : 'https'
    },
    //   sendSelfEndpoint: 'localhost:3020',
    secret: process.env.COMPANION_SECRET,
    debug: true
  }; // app.use('/uppy', checkAuth)
  // app.use('/uppy', checkVideoID(models))

  app.use('/uppy', _companion.default.app(options));
}

function confirmVideoConversion(app, models) {
  app.post('/confirmVideoConversion', (req, res) => {
    console.log(req.headers.origin);
    return res.status(200).send();
  });
}