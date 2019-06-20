"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getUppy;

var _path = _interopRequireDefault(require("path"));

var _companion = _interopRequireDefault(require("@uppy/companion"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const DATA_DIR = _path.default.join(__dirname, process.env.COMPANION_UPLOAD_FOLDER);

function getUppy() {
  console.log(process.env.COMPANION_AWS_KEY, process.env.COMPANION_AWS_SECRET);
  const options = {
    providerOptions: {
      s3: {
        //   getKey: (req, filename) =>
        //     `whatever/${Math.random().toString(32).slice(2)}/${filename}`,
        key: process.env.COMPANION_AWS_KEY,
        secret: process.env.COMPANION_AWS_SECRET,
        bucket: process.env.COMPANION_AWS_BUCKET,
        region: process.env.COMPANION_AWS_REGION
      }
    },
    server: {
      host: process.env.NODE_ENV !== 'production' ? `${process.env.HOST}:${process.env.PORT}` : process.env.HOST,
      protocol: process.env.NODE_ENV !== 'production' ? 'http' : 'https'
    },
    //   sendSelfEndpoint: 'localhost:3020',
    secret: process.env.COMPANION_SECRET,
    debug: true,
    filePath: DATA_DIR
  };
  return _companion.default.app(options);
}