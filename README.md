# diversus - blossom:server
This is a express.js based server running the [diversus flower](https://github.com/diversus-me/blossom).
For more information on this project, please visit [diversus.me](https://www.diversus.me/)

### Features & Stack

- Magic Link login system
- DynamoDB based sessions
- PostgreSQL Database
- Sequelize.js

### Installation & Development

#### Database
Create a local PostgreSQL database and run `session.sql` to set up the local session store.
 
#### Environment
Duplicate `.env.example` and name it `.env`
```
cp .env.example .env
```
Add credentials to a mailing server and your local PostgreSQL database. You'll also need a Youtube API key.

#### Node.js server
```
npm install
npm start
```
