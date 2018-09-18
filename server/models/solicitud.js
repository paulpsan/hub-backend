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
      institucion: DataTypes.TEXT,
      descripcion: DataTypes.TEXT,
      estado: DataTypes.TEXT,
      path: DataTypes.TEXT,
      cargo: DataTypes.TEXT,
    }, {
      tableName: "solicitud",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}