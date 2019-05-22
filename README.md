# diversus - blossom:server
This is a express.js based server running the [diversus flower](https://github.com/diversus-me/blossom).
For more information on this project, please visit [diversus.me](https://www.diversus.me/)

### Features & Stack

- Magic Link login system
- DynamoDB based sessions
- PostgreSQL Database
- Sequelize.js

### Installation & Development

#### Configuration
Copy .env.example to .env
```
> cp .env.example .env
```
Add values according to your local dev environment

#### Database
Create a passwordless PostgreSQL database running on port 5432 called *blossom-dev*.

#### Mailing
For Mailing support you need to connect your own mail adress for testing purposes. You can inject the login details through the following environment variables.

```
EMAIL_USER
EMAIL_PASSWORD
EMAIL_HOST
EMAIL_PORT
```

#### Node.js server
```
npm install
npm start
```
