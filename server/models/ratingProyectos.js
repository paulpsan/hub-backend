"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "RatingProyectos",
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
      tableName: "rating_proyecto",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
