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
      downloads: DataTypes.INTEGER,
      issues: DataTypes.INTEGER,
      stars: DataTypes.INTEGER,
      forks: DataTypes.INTEGER,
      commits: DataTypes.INTEGER,
      votaciones: DataTypes.INTEGER
    },
    {
      tableName: "rating",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
