"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Categoria", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      nombre: {
        type: DataTypes.TEXT,
        unique: true
      },
      descripcion: DataTypes.TEXT,
      estado: DataTypes.TEXT,
    }, {
      tableName: "categoria",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}