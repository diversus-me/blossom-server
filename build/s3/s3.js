"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getPresignedUploadUrl = getPresignedUploadUrl;

var _awsSdk = _interopRequireDefault(require("aws-sdk"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

const s3 = new _awsSdk.default.S3({
  accessKeyId: process.env.COMPANION_AWS_KEY,
  secretAccessKey: process.env.COMPANION_AWS_SECRET
});

async function getPresignedUploadUrl(filename) {
  const key = `upload/${filename}`;
  const url = await s3.getSignedUrl('putObject', {
    Bucket: process.env.COMPANION_AWS_BUCKET,
    Key: key,
    ContentType: 'video/*'
  });
  return url;
}