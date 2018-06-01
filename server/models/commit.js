"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "Commit",
    {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      sha: DataTypes.STRING,
      autor: DataTypes.STRING,
      mensaje: DataTypes.STRING,
      fecha: DataTypes.DATE
    },
    {
      tableName: "commit",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
