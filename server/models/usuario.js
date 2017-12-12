'use strict';

export default (sequelize, DataTypes) => {
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
    password: {
      allowNull: false,
      type: DataTypes.TEXT,
      validate: {
        notEmpty: {
          msg: 'Ingrese su password'
        }
      }
    },
    role: {
      allowNull: false,
      type: DataTypes.TEXT,
      defaultValue:'usuario',
      validate: {
        notEmpty: {
          msg: 'Ingrese su role'
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
