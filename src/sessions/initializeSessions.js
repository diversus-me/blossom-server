import session from 'express-session'
import dynamoDB from 'connect-dynamodb'
import postgres from 'connect-pg-simple'
import pg from 'pg'

const maxAge = 86400000

export default function initializeSessions (app) {
  let store = {}
  if (process.env.NODE_ENV === 'production') {
    const dynamoOptions = {
      table: 'blossom-sessions',
      hashKey: 'sessionID',
      AWSConfigJSON: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
        region: 'eu-central-1'
      },
      readCapacityUnits: 5,
      writeCapacityUnits: 5
    }

    const DynamoDBStore = dynamoDB(session)
    store = new DynamoDBStore(dynamoOptions)
  } else {
    // TODO: Postgres as local session store not working
    const postgresOptions = {
      pool: pg.Pool({
        user: process.env.RDS_USERNAME,
        host: process.env.RDS_HOSTNAME,
        database: process.env.RDS_DB_NAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT
      })
    }
    const PostgresStore = postgres(session)
    // store = new PostgresStore(postgresOptions)
    store = null
  }

  app.use(session({
    store,
    secret: process.env.COOKIE_SECRET,
    key: 'user_sid',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge }
  }))
}
