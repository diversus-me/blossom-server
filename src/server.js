import express from 'express'
import cors from 'cors'

import connectPostgres from './postgres/connectPostgres'
import initPostgres from './postgres/initPostgres'
import initializeSessions from './sessions/initializeSessions'
import defineAPI from './defineAPI'

const PORT = process.env.HTTP_PORT || 8081
const app = express()

/* Connect to Database */
const postgres = connectPostgres()
postgres
  .authenticate()
  .then(() => {
    console.log('Connection to database established.')
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err)
  })

/* Sync with Database */
const models = initPostgres(postgres)

initializeSessions(app)

const whitelist = [
  `${process.env.HOST}`,
  'https://flower.dev.diversus.me',
  'https://flower.diversus.me',
  'https://flowerblossom-dev.netlify.com'
]

app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true)
    } else {
      callback(new Error('Not allowed by CORS'))
    }
  }
}))

app.use(express.json())
app.use(express.urlencoded())

/* Initiate API */
defineAPI(app, models)

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`)
})
