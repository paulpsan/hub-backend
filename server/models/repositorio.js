"use strict";

export default function(sequelize, DataTypes) {
  return sequelize.define(
    "Repositorio",
    {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      id_repositorio: DataTypes.STRING,
      nombre: DataTypes.STRING,
      descripcion: DataTypes.STRING,
      html_url: DataTypes.STRING,
      git_url: DataTypes.STRING,
      fork: { type: DataTypes.JSONB },
      hooks: { type: DataTypes.JSONB },
      tags: { type: DataTypes.JSONB },
      isuues: { type: DataTypes.JSONB },
      branches: { type: DataTypes.JSONB },
      lenguajes: { type: DataTypes.JSONB },
      commits: { type: DataTypes.JSONB },
      downloads: { type: DataTypes.JSONB }
    },
    {
      tableName: "repositorio",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
