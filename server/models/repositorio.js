"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "Repositorio", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      id_repositorio: DataTypes.INTEGER,
      nombre: DataTypes.STRING,
      descripcion: DataTypes.TEXT,
      avatar: DataTypes.TEXT,
      html_url: DataTypes.TEXT,
      visibilidad: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
      },
      estado: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      is_fork: {
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      tipo: DataTypes.STRING,
      git_url: DataTypes.STRING,
      api_url: DataTypes.STRING,
      stars: {
        type: DataTypes.JSONB
      },
      forks: {
        type: DataTypes.JSONB
      },
      hooks: {
        type: DataTypes.JSONB
      },
      tags: {
        type: DataTypes.JSONB
      },
      issues: {
        type: DataTypes.JSONB
      },
      branches: {
        type: DataTypes.JSONB
      },
      lenguajes: {
        type: DataTypes.JSONB
      },
      commits: {
        type: DataTypes.JSONB
      },
      downloads: {
        type: DataTypes.JSONB
      }
    }, {
      tableName: "repositorio",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}