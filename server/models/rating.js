"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "Rating",
    {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      issues: DataTypes.INTEGER,
      stars: DataTypes.INTEGER,
      forks: DataTypes.INTEGER,
      votaciones: DataTypes.INTEGER
    },
    {
      tableName: "rating",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
