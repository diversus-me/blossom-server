# diversus - blossom:server
This is a express.js based server running the [diversus flower](https://github.com/diversus-me/blossom).
For more information on this project, please visit [diversus.me](https://www.diversus.me/)

### Features & Stack

- Magic Link login system
- DynamoDB based sessions
- PostgreSQL Database
- Sequelize.js

### Installation & Development

#### PostgreSQL
Setup PostgreSQL on your machine and create a new database. Afterwards you fill the database with the sample tables/data.

```bash
psql DATABASE_NAME < sample_database
```


#### Environment
Duplicate `.env.example` and name it `.env`
```
cp .env.example .env
```
Add **credentials** to a **mailing server**, **your local PostgreSQL database** and a **Youtube API key* inside the .env file.

#### Node.js server
```
npm install
npm start
```

#### Done

Now you can run the [client application](https://github.com/diversus-me/blossom) locally and it will get its data from the server you just set up locally.
