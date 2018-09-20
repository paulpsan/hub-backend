"use strict";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Usuario", {
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
      usuarioGitlab: {
        type: DataTypes.INTEGER,
      },
      email: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true
      },
      password: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "usuario"
      },

      login: {
        type: DataTypes.TEXT,
         allowNull: false,
        defaultValue: ""

      },
      cuentas: {
        type: DataTypes.JSONB
      },
      user_gitlab: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      admin_grupo: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      admin: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
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
        defaultValue: {
          repo: {},
          lenguajes: [],
          commits: []
        }
      },
      url: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      github: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      id_github: {
        type: DataTypes.INTEGER
      },
      gitlab: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      id_gitlab: {
        type: DataTypes.INTEGER
      },
      bitbucket: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      id_bitbucket: {
        type: DataTypes.STRING
      }
    }, {
      tableName: "usuario",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};