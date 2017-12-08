'use strict';

export default function(sequelize, DataTypes) {
  return sequelize.define('Repositorio', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: DataTypes.STRING,
    url: DataTypes.STRING,
    tipo: DataTypes.STRING
  }, {
    tableName: 'repositorio',
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion'
  });
}
