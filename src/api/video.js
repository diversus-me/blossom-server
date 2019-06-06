import fetch from 'node-fetch'
import moment from 'moment'
import momentDurationFormat from 'moment-duration-format' // eslint-disable-line no-unused-vars
const getVideoId = require('get-video-id')

export function getVideoLength (app, models) {
  app.get('/api/videoLength', (req, res) => {
    const vidId = getVideoId(req.query.videolink).id
    if (!vidId) {
      return res.status(424).send('Video not found')
    }

    fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`)
      .then(checkStatus)
      .then(body => {
        if (!body.items[0]) {
          throw Error('Video not found')
        } else {
          const duration = body.items[0].contentDetails.duration
          const parsedDuration = moment.duration(duration).format('s', { trim: false, useGrouping: false })
          res.status(200).send({ duration: parsedDuration })
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
