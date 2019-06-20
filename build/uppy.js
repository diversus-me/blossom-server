"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getUppy;

var _companion = _interopRequireDefault(require("@uppy/companion"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

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
      host: 'localhost:3020',
      protocol: 'http'
    },
    //   sendSelfEndpoint: 'localhost:3020',
    secret: process.env.COMPANION_SECRET,
    debug: true,
    filePath: process.env.COMPANION_UPLOAD_FOLDER
  };
  return _companion.default.app(options);
}