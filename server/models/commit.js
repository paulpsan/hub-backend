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
      sha: DataTypes.TEXT,
      autor: DataTypes.TEXT,
      mensaje: DataTypes.TEXT,
      fecha: DataTypes.DATE,
      avatar_autor: DataTypes.TEXT,
      estado: { type: DataTypes.BOOLEAN, defaultValue: true },
      web_url_autor: DataTypes.TEXT,
      id_usuario: DataTypes.INTEGER
    },
    {
      tableName: "commit",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}
