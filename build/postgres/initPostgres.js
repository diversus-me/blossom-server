"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = initDatabase;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function initDatabase(database) {
  const User = database.define('user', {
    name: {
      type: _sequelize.default.STRING,
      allowNull: false
    },
    email: {
      type: _sequelize.default.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    joined: {
      type: _sequelize.default.DATE,
      defaultValue: _sequelize.default.NOW
    },
    role: {
      type: _sequelize.default.STRING,
      defaultValue: 'user',
      allowNull: false
    }
  });
  const Flower = database.define('flower', {
    title: {
      type: _sequelize.default.STRING,
      allowNull: false
    },
    description: {
      type: _sequelize.default.TEXT,
      allowNull: true
    },
    created: {
      type: _sequelize.default.DATE,
      defaultValue: _sequelize.default.NOW
    }
  });
  const Node = database.define('node', {
    title: {
      type: _sequelize.default.STRING,
      allowNull: false
    },
    created: {
      type: _sequelize.default.DATE,
      defaultValue: _sequelize.default.NOW
    }
  });
  const Video = database.define('video', {
    url: {
      type: _sequelize.default.STRING,
      allowNull: false
    },
    uploaded: {
      type: _sequelize.default.DATE,
      defaultValue: _sequelize.default.NOW
    },
    type: {
      type: _sequelize.default.STRING,
      allowNull: false
    },
    duration: {
      type: _sequelize.default.INTEGER,
      allowNull: false
    }
  });
  const Connection = database.define('connection', {
    sourceIn: {
      type: _sequelize.default.INTEGER,
      allowNull: false
    },
    sourceOut: {
      type: _sequelize.default.INTEGER,
      allowNull: false
    },
    targetIn: {
      type: _sequelize.default.INTEGER,
      allowNull: false
    },
    targetOut: {
      type: _sequelize.default.INTEGER,
      allowNull: false
    },
    created: {
      type: _sequelize.default.DATE,
      defaultValue: _sequelize.default.NOW
    },
    flavor: {
      type: _sequelize.default.STRING,
      allowNull: false
    }
  }); // database.sync({ force: true })

  database.sync();
  Flower.belongsTo(User);
  Flower.belongsTo(Node);
  Node.belongsTo(User);
  Node.belongsTo(Video);
  Node.hasMany(Connection, {
    as: 'connections'
  });
  Connection.belongsTo(Node);
  Connection.belongsTo(Node, {
    as: 'targetNode'
  });
  Connection.belongsTo(User);
  Video.belongsTo(User);
  User.hasMany(Node, {
    as: 'Nodes'
  });
  User.hasMany(Flower, {
    as: 'Flowers'
  });
  User.hasMany(Video, {
    as: 'Videos'
  });
  User.hasMany(Connection, {
    as: 'Connections'
  });
  database.sync();
  return {
    Flower,
    Node,
    Connection,
    User,
    Video
  };
}