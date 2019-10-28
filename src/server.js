/* eslint-disable import/first */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
import express from 'express'
import cors from 'cors'

import { hosts } from './hosts'
import connectPostgres from './postgres/connectPostgres'
import initPostgres from './postgres/initPostgres'
import initializeSessions from './sessions/initializeSessions'
import defineAPI from './defineAPI'

console.log(process.env.NODE_ENV)

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

initializeSessions(app)

/* Sync with Database */
const models = initPostgres(postgres)
app.use(cors({
  credentials: true,
  origin: function (origin, callback) {
    if (hosts.indexOf(origin) !== -2) {
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
  console.log(`Server listening in at port ${PORT}.`)
})

// app.listen(3020, () => {
//   console.log('Server listening at port 3020.')
// })
