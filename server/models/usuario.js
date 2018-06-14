"use strict";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Usuario",
    {
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
            msg: "Ingrese su nombre"
          }
        }
      },
      email: {
        allowNull: false,
        type: DataTypes.TEXT,
        validate: {
          notEmpty: {
            msg: "Ingrese su correo electrónico"
          }
        }
      },
      password: {
        type: DataTypes.TEXT
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "usuario"
      },

      login: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      cuentas: {
        type: DataTypes.JSONB,
      },
      //tipo puede ser Local, Github, Gitlab.
      tipo: {
        type: DataTypes.TEXT,
        defaultValue: "local"
      },
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      clasificacion: {
        type: DataTypes.JSONB,
        defaultValue: {
          valor: 0,
          datos: []
        }
      },
      datos: {
        type: DataTypes.JSONB,
        defaultValue:{
          repo:{},
          lenguajes:[],
          commits:[]
        }
      },
      url: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      estado: {
        type: DataTypes.STRING,
      }
    },
    {
      tableName: "usuario",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};
