import Sequelize from 'sequelize'

export default function initDatabase(database) {
    const User = database.define('user', {
        name: {
            type: Sequelize.STRING,
            allowNull: false
        },
        email: {
            type:Sequelize.STRING,
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            }
        },
        joined: {
            type:Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    })

    const Flower = database.define('flower', {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        description: {
            type: Sequelize.TEXT,
            allowNull: true,
        },
        created: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        }
    })

    const Node = database.define('node', {
        title: {
            type: Sequelize.STRING,
            allowNull: false
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false
        },
        created: {
            type:Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
    })

    const Video = database.define('video', {
        url: {
            type: Sequelize.STRING,
            allowNull: false
        },
        uploaded: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.NOW
        },
        type: {
            type: Sequelize.STRING,
            allowNull: false
        }
    })

    const Connection = database.define('connection', {
        sourceIn: {
            type: Sequelize.STRING,
            allowNull: false
          },
          sourceOut: {
              type: Sequelize.STRING,
              allowNull: false
          },
          targetIn: {
              type: Sequelize.STRING,
              allowNull: false
          },
          targetOut: {
              type: Sequelize.STRING,
              allowNull: false
          }
    })

    database.sync({ force: true })

    Flower.belongsTo(User)
    Flower.belongsTo(Node)

    Node.belongsTo(User)
    Node.hasMany(Connection, {as: 'connections'})

    Connection.belongsTo(Node, {as: 'sourceVideo'})
    Connection.belongsTo(Node, {as: 'targetVideo'})

    Video.belongsTo(User)

    User.hasMany(Node, {as: 'nodes'})
    User.hasMany(Flower, {as: 'flowers'})
    User.hasMany(Video, {as: 'videos'})

    return { Flower, Node, Connection, User, Video }
}