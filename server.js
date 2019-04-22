import path from 'path'
import express from 'express'

const PORT = process.env.HTTP_PORT || 5000
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