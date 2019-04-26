"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports["default"] = initDatabase;

var _sequelize = _interopRequireDefault(require("sequelize"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function initDatabase(database) {
  var User = database.define('user', {
    name: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    email: {
      type: _sequelize["default"].STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    joined: {
      type: _sequelize["default"].DATE,
      defaultValue: _sequelize["default"].NOW
    }
  });
  var Flower = database.define('flower', {
    title: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    description: {
      type: _sequelize["default"].TEXT,
      allowNull: true
    },
    created: {
      type: _sequelize["default"].DATE,
      defaultValue: _sequelize["default"].NOW
    }
  });
  var Node = database.define('node', {
    title: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    type: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    created: {
      type: _sequelize["default"].DATE,
      defaultValue: _sequelize["default"].NOW
    }
  });
  var Video = database.define('video', {
    url: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    uploaded: {
      type: _sequelize["default"].DATE,
      defaultValue: _sequelize["default"].NOW
    },
    type: {
      type: _sequelize["default"].STRING,
      allowNull: false
    }
  });
  var Connection = database.define('connection', {
    sourceIn: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    sourceOut: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    targetIn: {
      type: _sequelize["default"].STRING,
      allowNull: false
    },
    targetOut: {
      type: _sequelize["default"].STRING,
      allowNull: false
    }
  });
  database.sync({
    force: true
  });
  Flower.belongsTo(User);
  Flower.belongsTo(Node);
  Node.belongsTo(User);
  Node.hasMany(Connection, {
    as: 'connections'
  });
  Connection.belongsTo(Node, {
    as: 'sourceVideo'
  });
  Connection.belongsTo(Node, {
    as: 'targetVideo'
  });
  Video.belongsTo(User);
  User.hasMany(Node, {
    as: 'nodes'
  });
  User.hasMany(Flower, {
    as: 'flowers'
  });
  User.hasMany(Video, {
    as: 'videos'
  });
  return {
    Flower: Flower,
    Node: Node,
    Connection: Connection,
    User: User,
    Video: Video
  };
}