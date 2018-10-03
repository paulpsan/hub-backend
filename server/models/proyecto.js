"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Proyecto", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true
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
      descripcion: {
        type: DataTypes.TEXT
      },
      visibilidad: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      path: {
        type: DataTypes.TEXT,
        unique: true,
      },
      urlRepositorio: {
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
      commits: {
        type: DataTypes.JSONB
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
      },
      es_grupo: {
        type: DataTypes.BOOLEAN,
      },
      version: {
        type: DataTypes.TEXT
      },
      sistemas_operativos: {
        type: DataTypes.TEXT
      },
      base_datos: {
        type: DataTypes.TEXT
      },
      lenguajes: {
        type: DataTypes.TEXT
      },
      dependencias: {
        type: DataTypes.TEXT
      },
      alcances: {
        type: DataTypes.TEXT
      },
      reglas_desarrollo: {
        type: DataTypes.TEXT
      },
      reglas_contribucion: {
        type: DataTypes.TEXT
      },
      funcionalidades: {
        type: DataTypes.TEXT
      },
      comunicacion: {
        type: DataTypes.TEXT
      },
      errores: {
        type: DataTypes.TEXT
      },

    }, {
      tableName: "proyecto",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}