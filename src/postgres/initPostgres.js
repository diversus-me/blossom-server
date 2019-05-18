import Sequelize from 'sequelize'

export default function initDatabase (database) {
  const User = database.define('user', {
    name: {
      type: Sequelize.STRING,
      allowNull: false
    },
    email: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    joined: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    role: {
      type: Sequelize.STRING,
      defaultValue: 'user',
      allowNull: false
    }
  })

  const Flower = database.define('flower', {
    title: {
      type: Sequelize.STRING,
      allowNull: false
    },
    description: {
      type: Sequelize.TEXT,
      allowNull: true
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
    created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    }
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
    },
    duration: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  })

  const Connection = database.define('connection', {
    sourceIn: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    sourceOut: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    targetIn: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    targetOut: {
      type: Sequelize.INTEGER,
      allowNull: false
    },
    created: {
      type: Sequelize.DATE,
      defaultValue: Sequelize.NOW
    },
    flavor: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })

  // database.sync({ force: true })
  database.sync()

  Flower.belongsTo(User)
  Flower.belongsTo(Node)

  Node.belongsTo(User)
  Node.belongsTo(Video)
  Node.hasMany(Connection, { as: 'connections' })

  Connection.belongsTo(Node)
  Connection.belongsTo(Node, { as: 'targetNode' })
  Connection.belongsTo(User)

  Video.belongsTo(User)

  User.hasMany(Node, { as: 'Nodes' })
  User.hasMany(Flower, { as: 'Flowers' })
  User.hasMany(Video, { as: 'Videos' })
  User.hasMany(Connection, { as: 'Connections' })

  database.sync()

  return { Flower, Node, Connection, User, Video }
}
