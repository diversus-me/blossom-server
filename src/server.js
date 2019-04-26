import express from 'express'

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

initializeSessions(app)

/* Initiate API */
defineAPI(app, models)

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`)
})