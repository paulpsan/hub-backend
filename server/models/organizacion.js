'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Organizacion', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: DataTypes.STRING,
    descripcion: DataTypes.STRING
  });
}
