const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const admin = sequelize.define('admin', {
  username: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = admin;