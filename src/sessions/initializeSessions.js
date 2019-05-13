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

export default function initializeSessions(app){
    if (process.env.NODE_ENV === 'production') {
        app.use(session({
            store: new DynamoDBStore(options),
            secret: process.env.cookieSecret,
            key: 'user_sid',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge,
            }
        }))
    } else {
        app.use(session({
            secret: 'development',
            key: 'user_sid',
            resave: false,
            saveUninitialized: true,
            cookie: {
                maxAge,
            }
        }))
    }
}