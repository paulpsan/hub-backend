"use strict";

export default (sequelize, DataTypes) => {
  return sequelize.define(
    "Grupo", {
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
      id_gitlab: {
        type: DataTypes.INTEGER
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
      visibility: {
        type: DataTypes.TEXT,
      },
      url: {
        type: DataTypes.TEXT,
        defaultValue: ""
      },
    }, {
      tableName: "grupo",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
};