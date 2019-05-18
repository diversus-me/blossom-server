import { checkSchema, validationResult } from 'express-validator/check'
import fetch from 'node-fetch'
import moment from 'moment'
import momentDurationFormat from 'moment-duration-format'
const getVideoId = require('get-video-id')

export function createFlower (app, models) {
  app.post('/api/flower', checkSchema({
    title: {
      isString: {
        errorMessage: 'Title is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Title is empty'
      }
    },
    description: {
      isString: {
        errorMessage: 'Description is not a string'
      }
    },
    type: {
      isString: {
        errorMessage: 'Type is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Type is empty'
      },
      custom: {
        options: value => (value === 'youtube'),
        errorMessage: 'Type is not supported'
      }
    },
    link: {
      isString: {
        errorMessage: 'Link is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Link is empty'
      },
      custom: {
        options: (value) => {
          const { id } = getVideoId(value)
          return id
        },
        errorMessage: 'Malformed link.'
      }
    }
  }), (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      console.log(errors.array())
      return res.status(422).jsonp(errors.array())
    }
    const { title, description, type, link } = req.body
    models.User.findOne({
      where: {
        id: req.session.userID
      }
    }).then(user => {
      if (!user) {
        return res.status(404).send('User not found.')
      } else {
        const vidId = getVideoId(link).id
        fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}`)
          .then(checkStatus)
          .then(body => {
            console.log(body.items[0].contentDetails.duration)
            if (!body.items[0]) {
              throw Error('Video not found')
            } else {
              const duration = body.items[0].contentDetails.duration
              const parsedDuration = moment.duration(duration).format('s', { trim: false, useGrouping: false })
              models.Video.create({
                type,
                userId: user.get('id'),
                url: vidId,
                duration: parsedDuration
              }).then((video) => {
                models.Node.create({
                  title,
                  videoId: video.get('id'),
                  userId: user.get('id'),
                  created: new Date()
                })
                  .then((node) => {
                    models.Flower.create({
                      title,
                      description,
                      userId: user.get('id'),
                      nodeId: node.get('id'),
                      created: new Date()
                    }).then((flower) => {
                      return res.status(200).send({ message: 'Flower was created' })
                    })
                  })
              })
            }
          })
          .catch(() => res.status(424).send('Video not found'))
      }
    })
  })
}

export function addNode (app, models) {
  app.post('/api/node', checkSchema({
    id: {
      isInt: {
        errorMessage: 'ID is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'ID not specified.'
      }
    },
    title: {
      isString: {
        errorMessage: 'Title is not a string.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Title not specified.'
      }
    },
    type: {
      isString: {
        errorMessage: 'Type is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Type is empty'
      },
      custom: {
        options: value => (value === 'youtube'),
        errorMessage: 'Type is not supported'
      }
    },
    link: {
      isString: {
        errorMessage: 'Link is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Link is empty'
      },
      custom: {
        options: (value) => {
          const { id } = getVideoId(value)
          return id
        },
        errorMessage: 'Malformed link.'
      }
    },
    sourceIn: {
      isInt: {
        errorMessage: 'SourceIn is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'SourceIn is empty'
      }
    },
    sourceOut: {
      isInt: {
        errorMessage: 'SourceOut is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'SourceOut is empty'
      }
    },
    flavor: {
      isString: {
        errorMessage: 'Flavor is not a string'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'Flavor is empty'
      }
    },
    targetIn: {
      isInt: {
        errorMessage: 'TargetIn is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'TargetIn is empty'
      }
    },
    targetOut: {
      isInt: {
        errorMessage: 'TargetOut is not an integer.'
      },
      isEmpty: {
        negated: true,
        errorMessage: 'TargetOut is empty'
      }
    }
  }), (req, res) => {
    const errors = validationResult(req)

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    } else {
      const { id, title, type, link, sourceIn, sourceOut, targetIn, targetOut, flavor } = req.body
      models.User.findOne({
        where: {
          id: req.session.userID
        }
      }).then(user => {
        if (!user) {
          return res.status(404).send('User not found.')
        } else {
          const vidId = getVideoId(link).id
          fetch(`https://www.googleapis.com/youtube/v3/videos?part=contentDetails&id=${vidId}&key=${process.env.YOUTUBE_API_KEY}k`)
            .then(checkStatus)
            .then(body => {
              if (!body.items[0]) {
                throw Error('Video not found')
              } else {
                const duration = body.items[0].contentDetails.duration
                const parsedDuration = moment.duration(duration).format('s', { trim: false, useGrouping: false })
                models.Video.create({
                  type,
                  userId: user.get('id'),
                  url: vidId,
                  duration: parsedDuration
                }).then((video) => {
                  models.Node.create({
                    title,
                    videoId: video.get('id'),
                    userId: user.get('id'),
                    created: new Date()
                  })
                    .then((node) => {
                      models.Connection.create({
                        sourceIn,
                        sourceOut,
                        targetIn,
                        targetOut,
                        flavor,
                        userId: user.get('id'),
                        targetNodeId: node.get('id'),
                        nodeId: id,
                        created: new Date()
                      }).then((connection) => {
                        return res.status(200).send({ message: 'Node was created' })
                      })
                    })
                })
              }
            }).catch((error) => {
              console.log(error)
              return res.status(424).send('Video not found')
            })
        }
      })
    }
  })
}

function checkStatus (res) {
  if (res.ok) { // res.status >= 200 && res.status < 300
    return res.json()
  } else {
    throw Error('Connection Fail')
  }
}
