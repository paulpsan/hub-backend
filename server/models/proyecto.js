"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "Proyecto",
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
            msg: "Ingrese el nombre del proyecto"
          }
        }
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
      tipo: {
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
        type: DataTypes.JSONB
      },
      commits: {
        type: DataTypes.TEXT
      },
      fechaCreacion: {
        type: DataTypes.DATE
      },
      ultimaActividad: {
        type: DataTypes.DATE
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      datos: {
        type: DataTypes.JSONB
      }
    },
    {
      tableName: "proyecto",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
