"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Proyecto", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Ingrese el nombre del proyecto"
          }
        }
      },
      proyectoGitlab: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      visibilidad: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      urlRepositorio: {
        allowNull: false,
        type: DataTypes.TEXT,
        validate: {
          notEmpty: {
            msg: "Ingrese la url del repositorio del proyecto"
          }
        }
      },
      avatar: {
        type: DataTypes.TEXT
      },
      categorias: {
        type: DataTypes.JSONB
      },
      licencias: {
        type: DataTypes.JSONB
      },
      clasificacion: {
        type: DataTypes.JSONB
      },
      usuarios: {
        type: DataTypes.JSONB,
        defaultValue: {
          datos: [],
          valor: 0
        }
      },
      commits: {
        type: DataTypes.JSONB
      },
      fechaCreacion: {
        type: DataTypes.DATE
      },
      ultimaActividad: {
        type: DataTypes.DATE
      },
      tipo: {
        type: DataTypes.TEXT
      },
      datos: {
        type: DataTypes.JSONB
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      }
    }, {
      tableName: "proyecto",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}