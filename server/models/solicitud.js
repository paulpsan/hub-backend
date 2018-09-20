"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Solicitud", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      institucion: {
        type: DataTypes.TEXT,
        unique: true
      },
      descripcion: DataTypes.TEXT,
      estado: DataTypes.TEXT,
      path: {
        type: DataTypes.TEXT,
        unique: true
      },
      cargo: DataTypes.TEXT,
    }, {
      tableName: "solicitud",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}