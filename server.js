import path from 'path'
import express from 'express'

const pgp = require('pg-promise')()
const connection = {}

if (process.env.NODE_ENV === 'production') {
  const connection = {
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    database: process.env.RDS_DB_NAME,
    user: process.env.RDS_USERNAME,
    password: process.env.RDS_PASSWORD
  }
}

const db = pgp(connection)

const PORT = process.env.HTTP_PORT || 8081
const app = express()

app.get('/flowers', (req, res) => {
  res.json({
    name: 'Dandelion',
    colour: 'Blue-ish'
  })
})

app.listen(PORT, () => {
  console.log(`Server listening at port ${PORT}.`)
})