import Sequelize from 'sequelize'

export default function connectPostgres () {
  return new Sequelize(
    process.env.RDS_DB_NAME,
    process.env.RDS_USERNAME,
    process.env.RDS_PASSWORD,
    {
      host: process.env.RDS_HOSTNAME,
      port: process.env.RDS_PORT,
      dialect: 'postgres',
      dialectOptions: {
        ssl: process.env.RDS_SSL === 'true'
      },
      logging: false
    }
  )
}
