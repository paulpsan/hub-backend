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
        // validate: {
        //   notEmpty: {
        //     msg: "Ingrese su password"
        //   }
        // }
      },
      role: {
        type: DataTypes.TEXT,
        defaultValue: "usuario"
      },

      login: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      //tipo puede ser Local, Github, Gitlab.
      tipo: {
        type: DataTypes.TEXT,
        defaultValue: "local"
        // validate: {
        //   notEmpty: {
        //     msg: "Ingrese su role"
        //   }
        // }
      },
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      descripcion: {
        type: DataTypes.STRING
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
        defaultValue: [
          {
            commits: "",
            lenguajes: {
              javascript: 0,
              php: 0
            },
            repo: {
              id: "",
              name: ""
            }
          }
        ]
      }
    },
    {
      tableName: "usuario",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};
