
import { Vimeo } from 'vimeo'
import multer from 'multer'
import fs from 'fs'

const client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_TOKEN)

const upload = multer({
  limits: { fieldSize: 1024 * 1024 * 1024 }
})

export function uploadVideo (app) {
  app.post('/api/uploadVideo', upload.single('video'), async (req, res) => {
    const videoRef = `../videoFiles/${req.body.fileName}`
    fs.writeFile(videoRef, req.file.buffer, function (err) {
      if (err) {
        console.log('File Write Error:', err)
      } else {
        console.log('Successfully written File.')
      }

      client.upload(
        videoRef,
        function (uri) {
          console.log('File upload completed. Your Vimeo URI is:', uri)
          res.status(200).send({ uri })
        },
        function (bytesUploaded, bytesTotal) {
          var percentage = (bytesUploaded / bytesTotal * 100).toFixed(2)
          console.log(bytesUploaded, bytesTotal, percentage + '%')
        },
        function (error) {
          console.log('Video Upload failed because: ' + error)
        }
      )
    })
  })
}
