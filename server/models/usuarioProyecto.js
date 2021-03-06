"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "UsuarioProyecto", {
      _id: {
        type: DataTypes.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
      },
      nombre_permiso: {
        type: DataTypes.TEXT,
      },
      access_level: {
        type: DataTypes.TEXT,
      }
    }, {
      tableName: "UsuarioProyecto",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}