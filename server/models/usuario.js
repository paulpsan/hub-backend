'use strict';

export default function (sequelize, DataTypes) {
  return sequelize.define('Usuario', {
    _id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      autoIncrement: true
    },
    nombre: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Ingrese su nombre'
        }
      }
    },
    email: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Ingrese su correo electrónico'
        }
      }
    },
    datos: {
      type: DataTypes.JSONB,
      defaultValue: {
        commits: 0
      }
    }
  }, {
    tableName: 'usuario',
    createdAt: 'fecha_creacion',
    updatedAt: 'fecha_modificacion'
  });
}
