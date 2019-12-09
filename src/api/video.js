import fetch from 'node-fetch'
import moment from 'moment'
import momentDurationFormat from 'moment-duration-format'

import { Vimeo } from 'vimeo'
import multer from 'multer'
import fs from 'fs' // eslint-disable-line no-unused-vars
const getVideoId = require('get-video-id')

const upload = multer({
  limits: { fieldSize: 1024 * 1024 * 1024 }
})

export function uploadVideo (app) {
  const client = new Vimeo(process.env.VIMEO_CLIENT_ID, process.env.VIMEO_CLIENT_SECRET, process.env.VIMEO_TOKEN)
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

export function getVideoMeta (app, models) {
  app.get('/api/videoMeta', (req, res) => {
    const vidId = getVideoId(req.query.videolink).id
    if (!vidId) {
      return res.status(424).send('Video not found')
    }

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(checkStatus)
      .then(body => {
        if (!body.items[0]) {
          throw Error('Video not found')
        } else {
          const duration = body.items[0].contentDetails.duration
          const snippet = body.items[0].snippet
          const parsedDuration = moment.duration(duration).format('s', { trim: false, useGrouping: false })
          res.status(200).send({
            duration: parsedDuration,
            title: snippet.title
          })
        }
      })
      .catch((error) => {
        console.log(error)
        return res.status(424).send('Video not found')
      })
  })
}

function checkStatus (res) {
  if (res.ok) {
    return res.json()
  } else {
    throw Error('Connection Fail')
  }
}
