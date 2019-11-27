import session from 'express-session'
import redis from 'redis'
import redisStore from 'connect-redis'

const maxAge = 2629746000

export default function initializeSessions (app) {
  let store = null
  console.log(process.env.COOKIE_SECRET)
  if (process.env.NODE_ENV === 'production') {
    const RedisStore = redisStore(session)

    const client = redis.createClient(
      process.env.SESSION_PORT, process.env.SESSION_HOST,
      {
        auth_pass: process.env.SESSION_PASSWORD,
        password: process.env.SESSION_PASSWORD,
        tls: { servername: process.env.SESSION_HOST }
      })
    client.auth(process.env.SESSION_PASSWORD)
    client.on('error', function (err) {
      console.log('Redis Error ' + err)
    })
    store = new RedisStore({
      client
    })
    app.use(session({
      store,
      secret: process.env.COOKIE_SECRET,
      key: 'user_sid',
      resave: false,
      saveUninitialized: true,
      cookie: {
        maxAge,
        secure: false,
        httpOnly: false
      }
    }))
  } else {
    store = null
    app.use(session({
      store,
      secret: process.env.COOKIE_SECRET,
      key: 'user_sid',
      resave: false,
      saveUninitialized: true,
      cookie: { maxAge }
    }))
  }
}
