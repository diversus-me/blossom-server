import session from 'express-session'
import dynamoDB from 'connect-dynamodb'
import postgres from 'connect-pg-simple'
import pg from 'pg'

const maxAge = 86400000

let store = {}
if (process.env.NODE_ENV === 'production') {
  const dynamoOptions = {
    table: 'blossom-sessions',
    hashKey: 'sessionID',
    // Optional JSON object of AWS credentials and configuration
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
  store = new PostgresStore(postgresOptions)
}

export default function initializeSessions (app) {
  app.use(session({
    store,
    secret: process.env.COOKIE_SECRET,
    key: 'user_sid',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge }
  }))
}
