const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const appointment = sequelize.define('appointment', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, unique: true, allowNull: false },
  password: { type: DataTypes.STRING, allowNull: false },
});

module.exports = appointment;