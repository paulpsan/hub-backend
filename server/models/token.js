"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "Token",
    {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      token: DataTypes.TEXT,
      tipo: DataTypes.TEXT,
    },
    {
      tableName: "token",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
