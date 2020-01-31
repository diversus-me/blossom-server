/* eslint-disable import/first */
if (process.env.NODE_ENV !== 'production') {
  require('dotenv').config()
}
import express from 'express'
import cors from 'cors'

import { hosts } from './hosts'
import connectPostgres from './postgres/connectPostgres'
import initPostgres from './postgres/initPostgres'
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

// console.log(process.env.AUTH_TOKEN)

// fetch('https://auth.serv.timz.io/auth/graphql', {
//   method: 'POST',
//   // body: 'query { user(id: 6) { id name username email_verified }}',
//   body: JSON.stringify({ query: '{ user(id: 6) { id name username email_verified }}' }),
//   headers: {
//     Authorization: 'Bearer ' + process.env.AUTH_TOKEN,
//     'Content-Type': 'application/json'
//   }
// })
//   // .then(response => console.log(response))
//   .then(response => response.json())
//   .then(json => console.log(json))
//   .catch(e => console.log(e))

// console.log(new Date(1579625667))
