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
    console.log('Connection to database established.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })

/* Sync with Database */
const models = initPostgres(postgres)

const getVideoId = require('get-video-id')

console.log(getVideoId('test'))

initializeSessions(app)

app.use(cors({
  credentials: true,
  origin: [
    `${process.env.HOST}`,
    'https://flower.dev.diversus.me',
    'https://flower.diversus.me',
    'https://flowerblossom-dev.netlify.com'
  ]
}))

app.use(express.json())
app.use(express.urlencoded())

/* Initiate API */
defineAPI(app, models)

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`)
})