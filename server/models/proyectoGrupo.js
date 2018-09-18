"use strict";

export default function (sequelize, DataTypes) {
  return sequelize.define(
    "ProyectoGrupo", {
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
      tableName: "ProyectoGrupo",
      createdAt: "fecha_creacion",
      updatedAt: "fecha_modificacion"
    }
  );
}