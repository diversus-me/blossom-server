import express from 'express'
import sequelize, { Sequelize } from 'sequelize'

// const pgp = require('pg-promise')()
// const connection = {}

// if (process.env.NODE_ENV === 'production') {
//   const connection = {
//     host: process.env.RDS_HOSTNAME,
//     port: process.env.RDS_PORT,
//     database: process.env.RDS_DB_NAME,
//     user: process.env.RDS_USERNAME,
//     password: process.env.RDS_PASSWORD
//   }
// }

// const db = pgp(connection)

const db = new Sequelize(
  process.env.RDS_DB_NAME,
  process.env.RDS_USERNAME,
  process.env.RDS_PASSWORD,
  {
    host: process.env.RDS_HOSTNAME,
    port: process.env.RDS_PORT,
    dialect: 'postgres'
  }
)

db
  .authenticate()
  .then(() => {
    console.log('Connection to database established.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  })

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