import session from 'express-session'
import dynamoDB from 'connect-dynamodb'

const maxAge = 86400000

const options = {
  table: 'blossom-sessions',
  hashKey: 'sessionID',
  // Optional JSON object of AWS credentials and configuration
  AWSConfigJSON: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    region: 'eu-central-1'
  },

  // Optional ProvisionedThroughput params, defaults to 5
  readCapacityUnits: 5,
  writeCapacityUnits: 5
}

const DynamoDBStore = dynamoDB(session)

export default function initializeSessions (app) {
  app.use(session({
    store: process.env.NODE_ENV === 'production' ? new DynamoDBStore(options) : null,
    secret: process.env.COOKIE_SECRET,
    key: 'user_sid',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge }
  }))
}
