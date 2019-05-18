import Sequelize from 'sequelize'

export default function connectPostgres () {
  if (process.env.NODE_ENV === 'production') {
    return new Sequelize(
      process.env.RDS_DB_NAME,
      process.env.RDS_USERNAME,
      process.env.RDS_PASSWORD,
      {
        host: process.env.RDS_HOSTNAME,
        port: process.env.RDS_PORT,
        dialect: 'postgres'
      }
    )
  } else {
    return new Sequelize(
      'blossom-dev', 'peter', '',
      {
        host: 'localhost',
        port: 5432,
        dialect: 'postgres'
      }
    )
  }
}
