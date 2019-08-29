// import path from 'path'
import companion from '@uppy/companion'

// const DATA_DIR = path.join(__dirname, process.env.COMPANION_UPLOAD_FOLDER)

export default function getUppy () {
  console.log(process.env.COMPANION_AWS_KEY, process.env.COMPANION_AWS_SECRET)
  const options = {
    providerOptions: {
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

  return companion.app(options)
}
