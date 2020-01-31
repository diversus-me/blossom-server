import Sequelize from 'sequelize'

export default function initDatabase (database) {
  const Flower = database.define('flower', {
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
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
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
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

  const Video = database.define('video', {
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
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
    user: {
      type: Sequelize.STRING,
      allowNull: false
    },
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
    },
    claps: {
      type: Sequelize.INTEGER,
      allowNull: false
    }
  })

  const Permission = database.define('permission', {
    user: {
      type: Sequelize.STRING,
      allowNull: false
    }
  })

  // database.sync({ force: true })
  database.sync()

  Flower.belongsTo(Node)

  Node.belongsTo(Video)
  Node.hasMany(Connection, { as: 'connections' })

  Connection.belongsTo(Node)
  Connection.belongsTo(Node, { as: 'targetNode' })
  Permission.belongsTo(Flower)

  database.sync()
  // database.sync({ force: true })

  return { Flower, Node, Connection, Video, Permission }
}
