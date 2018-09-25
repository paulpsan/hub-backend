"use strict";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Grupo", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
      },
      nombre: {
        allowNull: false,
        type: DataTypes.TEXT,
        unique: true,
        validate: {
          notEmpty: {
            msg: "Ingrese su nombre"
          }
        }
      },
      entidad: {
        type: DataTypes.TEXT,
      },
      estado: {
        type: DataTypes.TEXT
      },
      avatar: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
      descripcion: {
        type: DataTypes.TEXT
      },
      visibilidad: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      path: {
        type: DataTypes.TEXT
      }
    }, {
      tableName: "grupo",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};