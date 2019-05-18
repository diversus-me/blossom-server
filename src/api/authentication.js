import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import { checkSchema, validationResult } from 'express-validator/check'

import htmlTemplate from './htmlTemplate'

const transporter = nodemailer.createTransport({
  auth: {
    pass: process.env.EMAIL_PASSWORD,
    user: process.env.EMAIL_USER
  },
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false
})

transporter.verify(function (error, success) {
  if (error) {
    console.log(error)
  } else {
    console.log('Server is ready to take our messages')
  }
})

export function loginLink (app, models) {
  app.post('/api/requestLoginLink', checkSchema({
    email: {
      isEmail: true,
      errorMessage: 'Invalid email'
    }
  }), (req, res) => {
    const { email } = req.body

    const errors = validationResult(req)

    const host = getHost(req)

    if (!host) {
      return res.status(403).jsonp(errors.array())
    }

    if (!errors.isEmpty()) {
      return res.status(422).jsonp(errors.array())
    } else {
      models.User.findOne({
        where: { email }
      }).then((user) => {
        if (user) {
          const token = generateToken(email)
          const mailOptions = {
            from: 'login@diversus.me',
            html: htmlTemplate(`${host}/?token=${token}`),
            subject: 'Login',
            to: email
          }
          transporter.sendMail(mailOptions, error => {
            if (error) {
              return res.status(500).send({ error })
            }
            return res.status(200).send({ message: `Mail has been sent to ${email}` })
          })
        } else {
          return res.status(404).send({ message: 'User does not exists}' })
        }
      })
    }
  })
}

export function login (app, models) {
  app.get('/api/login', (req, res) => {
    const token = req.query.token

    if (!token) {
      return res.status(422).send({ message: 'No token specified.' })
    } else {
      let decoded
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET)
      } catch (e) {
        return res.status(403).send({ message: 'Token incorrect.' })
      }
      if (!decoded.hasOwnProperty('email') || !decoded.hasOwnProperty('expiration')) {
        return res.status(403).send({ message: 'Token incorrect.' })
      }

      const { email, expiration } = decoded

      if (expiration < new Date()) {
        return res.status(403).send({ message: 'Token expired.' })
      }

      models.User.findOne({
        where: { email }
      }).then((user) => {
        if (!user) {
          return res.status(403).send({ message: 'User does not exists' })
        } else {
          req.session.role = user.get('role')
          req.session.userID = user.get('id')
          console.log(req.session.role, user.get('role'), user.get('id'), req.session.id)
          req.session.authenticated = true
          return res.status(200).send({ message: 'Successfully signed in.' })
        }
      })
    }
  })
}

export function checkLogin (app, models) {
  app.get('/api/checkLogin', (req, res) => {
    const { session } = req
    if (!session.authenticated) {
      return res.status(403).send({ message: 'Not Logged In' })
    } else {
      return res.status(200).send({ message: 'Successfully signed in.' })
    }
  })
}

function generateToken (email) {
  const date = new Date()
  date.setMinutes(date.getMinutes() + 15)
  return jwt.sign({ email, expiration: date }, process.env.JWT_SECRET)
}

// TODO correctly handle possible hosts for development and production
const hosts = [
  `${process.env.HOST}`,
  'https://flower.dev.diversus.me',
  'https://flower.diversus.me',
  'https://flowerblossom-dev.netlify.com'
]

// TODO not secure!!!
function getHost (req) {
  const host = req.headers.origin
  console.log(host)
  if (hosts.indexOf(host) > -1) {
    return host
  } else {
    return false
  }
}
