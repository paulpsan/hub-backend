'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('Proyecto', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    urlRepositorio: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Ingrese la url del repositorio del proyecto'
        }
      }
    },
    descripcion: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Ingrese una breve descripción del proyecto'
        }
      }
    },
    datos: {
      type: DataTypes.JSONB
    }
  }, {
    tableName: 'proyecto',
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion'
  });
}
