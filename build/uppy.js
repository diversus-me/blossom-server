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
      const url = req.query.filename.split('.')[0];

      if (!_shortid.default.isValid(url)) {
        return res.status(400).send('ID not found.');
      }

      const video = await models.Video.findOne({
        where: {
          url,
          duration: 0
        }
      });

      if (!video) {
        return res.status(404).send('Video not found.');
      }

      req.videoURL = video.get('url');
      req.filetype = req.query.filename.split('.')[1];
      next();
    } catch (error) {
      return res.status(500).send();
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
      const videoID = video.get('url');
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
    secret: process.env.COMPANION_SECRET,
    debug: true
  }; // app.use('/uppy', checkAuth)

  app.use('/uppy', checkVideoID(models));
  app.use('/uppy', _companion.default.app(options));
}

function confirmVideoConversion(app, models) {
  app.post('/confirmVideoConversion', (req, res) => {
    console.log(req.body);
    return res.status(200).send();
  });
}