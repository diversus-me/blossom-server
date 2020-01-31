import jwt from 'jsonwebtoken'

import { hosts } from '../hosts'

export function checkAdmin (req, res, next) {
  if (req.token && req.token.role === 'admin') {
    next()
  } else {
    return res.status(403).send()
  }
}

export function checkToken (req, res, next) {
  try {
    const authorization = req.header('Authorization')
    if (authorization.startsWith('Bearer ')) {
      const token = authorization.substring(7, authorization.length)
      const decoded = jwt.verify(token, process.env.AUTH_JWT_SECRET)

      const validDate = new Date().getTime() - (30 * 24 * 60 * 60 * 1000) // 30 days
      const tokenAge = new Date(decoded.iat * 1000)

      if (tokenAge < validDate) {
        throw Error('Token expired.')
      }

      req.token = decoded
      next()
    } else {
      throw Error('Malformed Token')
    }
  } catch (error) {
    console.log(error)
    res.status(401).send()
  }
}

export function checkLogin (app) {
  app.get('/api/checkLogin', checkToken, (req, res) => {
    const { token } = req
    if (token) {
      return res.status(200).send({ message: 'Successfully signed in.', name: token.name, role: token.role, id: token.sub })
    } else {
      return res.status(403).send({ message: 'Not Logged In' })
    }
  })
}

function getHost (req) {
  if (process.env.NODE_ENV === 'development') {
    return 'http://localhost:3000'
  }

  const host = req.headers.origin
  if (hosts.indexOf(host) > -1) {
    return host
  } else {
    return false
  }
}
